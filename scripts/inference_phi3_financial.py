"""Livrable 1 : Optimisation et Inférence pour Phi-3.5-Financial."""

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

MODEL_NAME = "microsoft/Phi-3.5-mini-instruct"


def load_and_test_financial_model():
    """Charge le modèle avec des paramètres optimisés pour la finance."""
    print("Configuration de l'inférence financière (Temp: 0.3, Top_p: 0.85)...")

    # Quantization pour économiser la mémoire
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16
    )

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True
    )

    prompt = "<|user|>\nQuels sont les impacts de l'inflation sur les taux d'intérêt ?<|end|>\n<|assistant|>\n"
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    # Paramètres stricts pour la finance
    outputs = model.generate(
        **inputs,
        max_new_tokens=256,
        temperature=0.3,
        top_p=0.85,
        do_sample=True
    )

    print("\nRéponse du modèle validé :")
    print(tokenizer.decode(outputs[0], skip_special_tokens=True))


if __name__ == "__main__":
    load_and_test_financial_model()