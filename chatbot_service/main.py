import os
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from transformers import AutoModelForCausalLM, AutoTokenizer

app = FastAPI(title="Aadhavan Agencies Intelligent Chatbot API")

# Setup CORS to allow React Frontend Access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use Qwen2.5-0.5B-Instruct. It's very fast, small (approx 1GB VRAM/RAM), and smart.
MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"

print(f"Loading Intelligent Instruction Model: {MODEL_NAME}. Please wait a moment...")
try:
    # Determine the device dynamically
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    
    # We load in float16 for speed and lower memory usage if CUDA is available
    # For CPU, we use float32 or bfloat16 if supported, but float32 is safest
    model_kwargs = {"torch_dtype": torch.float16 if device == "cuda" else torch.float32}
    
    # Remove device_map="auto" to prevent accidental disk offloading errors on constrained systems
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME, 
        trust_remote_code=True,
        **model_kwargs
    )
    
    # Explicitly move to device
    model = model.to(device)
    
    print(f"Model {MODEL_NAME} loaded successfully on {device}!")
except Exception as e:
    print(f"Error loading model: {e}")
    tokenizer, model, device = None, None, "cpu"

class ChatMessage(BaseModel):
    role: str # "user" or "bot"
    content: str
    
class ChatRequest(BaseModel):
    history: List[ChatMessage] 
    new_message: str

class ChatResponse(BaseModel):
    response: str
    error: Optional[str] = None

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model is currently unavailable. Please try again later.")
        
    try:
        # Construct the specialized instruct message mapping
        messages = [
            {"role": "system", "content": "You are a helpful and polite professional AI assistant for Aadhavan Agencies, a B2B wholesale grocery and agriculture logistics company based in India. Always give direct, intelligent, and helpful business answers."}
        ]
        
        # Append historical user/bot conversational traces
        for msg in request.history[-5:]: # Keep context to recent 5 interactions
            role_type = "user" if msg.role == "user" else "assistant"
            messages.append({"role": role_type, "content": msg.content})
            
        # Add the current prompt
        messages.append({"role": "user", "content": request.new_message})
        
        # Apply strict Chat Template for Qwen
        text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        # Tokenize and run generative inference parameters
        model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
        
        generated_ids = model.generate(
            **model_inputs,
            max_new_tokens=256,
            do_sample=True,
            top_k=50,
            top_p=0.9,
            temperature=0.7,
            pad_token_id=tokenizer.eos_token_id
        )
        
        # Trim off the input tokens from the generation
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]

        response_text = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()
        
        # Fallback handling
        if not response_text:
            response_text = "I'm sorry, I'm having trouble providing an answer right now. Please try again."
            
        return ChatResponse(response=response_text)
        
    except Exception as e:
        print(f"Error during chatting procedure: {str(e)}")
        return ChatResponse(
            response="I am currently experiencing an error. Please try again in a moment.",
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    # Important: reload=False to avoid reloading the huge model on every file change during dev.
    uvicorn.run(app, host="0.0.0.0", port=8000)
