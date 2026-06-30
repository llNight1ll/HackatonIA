import os
import torch
from peft import LoraConfig, TaskType, get_peft_model
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset

# Define paths for Colab environment
BASE_DIR = '/content'
TRAIN_DATA_PATH = os.path.join(BASE_DIR, "datasets", "medical_dataset_finetuning_cleaned.jsonl")
OUTPUT_DIR = os.path.join(BASE_DIR, "models", "phi-3.5-medical-lora")

os.makedirs(OUTPUT_DIR, exist_ok=True)

if not os.path.exists(TRAIN_DATA_PATH):
    print(f"Erreur : Le fichier {TRAIN_DATA_PATH} est introuvable.")
else:
    print("Initialisation de l'entraînement LoRA Médical...")

    train_dataset = load_dataset('json', data_files=TRAIN_DATA_PATH, split='train')
    print(f"Dataset chargé avec {len(train_dataset)} exemples.")

    BASE_MODEL = "microsoft/Phi-3.5-mini-instruct"

    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        torch_dtype=torch.float16,
        device_map="auto"
    )

    lora_config = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type=TaskType.CAUSAL_LM
    )

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # Le dataset contient les champs "instruction" et "output".
    # On construit une colonne "text" via le template de chat de Phi-3.5.
    def format_example(example):
        messages = [
            {"role": "user", "content": example["instruction"]},
            {"role": "assistant", "content": example["output"]},
        ]
        text = tokenizer.apply_chat_template(messages, tokenize=False)
        return {"text": text}

    train_dataset = train_dataset.map(
        format_example,
        remove_columns=train_dataset.column_names,
    )

    # Configuration SFTConfig
    sft_config = SFTConfig(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=2,
        learning_rate=2e-4,
        num_train_epochs=1,
        save_strategy="epoch",
        logging_steps=10,
        fp16=True,
        report_to="none",
        max_length=512,
        dataset_text_field="text",
    )

    trainer = SFTTrainer(
        model=model,
        train_dataset=train_dataset,
        args=sft_config,
        processing_class=tokenizer,
    )

    print("Démarrage du Fine-tuning...")
    trainer.train()
    trainer.save_model(OUTPUT_DIR)
    print(f"Entraînement terminé. Modèle sauvegardé dans {OUTPUT_DIR}")