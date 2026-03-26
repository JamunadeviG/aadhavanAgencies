import json
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling
)
from datasets import load_dataset, Dataset
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

"""
Chatbot Fine-tuning Script using Qwen 2.5 and LoRA
Adapted for Aadhavan Agencies B2B Grocery needs.
"""

MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"
OUTPUT_DIR = "./finetuned_qwen_output"
DATASET_PATH = "custom_dataset.json"

def prepare_finetuning():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Loading {MODEL_NAME} for fine-tuning on {device}...")
    
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Load model in bfloat16 or float16 if possible
    torch_dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16 if torch.cuda.is_available() else torch.float32
    
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME, 
        trust_remote_code=True,
        torch_dtype=torch_dtype,
        device_map="auto"
    )

    # Setup LoRA
    lora_config = LoraConfig(
        r=8,
        lora_alpha=32,
        target_modules=["q_proj", "v_proj"], # Specific for Qwen/Llama
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )
    
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    print("Loading domain dataset...")
    try:
        with open(DATASET_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        raw_dataset = Dataset.from_list(data)
    except Exception as e:
        print(f"Warning: Issue with custom_dataset.json ({str(e)})")
        # Same fallback
        mock_data = [
            {"text": "User: Bulk rice availability?\nAssistant: Yes, we have premium Sona Masoori in 25kg bags."},
            {"text": "User: Wholesale oil prices?\nAssistant: Our current wholesale rate for Sunflower oil is competitive for bulk buyers."}
        ]
        raw_dataset = Dataset.from_list(mock_data)

    def tokenize_function(examples):
        # We wrap the text in the chat template style manually or keep it simple
        # Since it's already "User: ... \nAssistant: ...", we just tokenize it.
        tokenized = tokenizer(examples["text"], truncation=True, padding="max_length", max_length=256)
        tokenized["labels"] = tokenized["input_ids"].copy()
        return tokenized

    tokenized_dataset = raw_dataset.map(tokenize_function, batched=True, remove_columns=["text"])

    data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        overwrite_output_dir=True,
        num_train_epochs=5, 
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        save_steps=100,
        save_total_limit=2,
        logging_steps=10,
        learning_rate=2e-4,
        fp16=True if device == "cuda" else False,
        push_to_hub=False,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        data_collator=data_collator,
    )

    print("Starting Fine-tuning loop...")
    trainer.train()

    print("Fine-tuning completed. Saving the custom model...")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print(f"Successfully saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    prepare_finetuning()
