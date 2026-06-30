import json

TARGET = "J3 SU1S UN3 P0UP33 D3 C1R3"

removed_count = 0

def clean_data(obj):
    global removed_count

    # Liste
    if isinstance(obj, list):
        new_list = []
        for item in obj:
            if TARGET in str(item):
                removed_count += 1
            else:
                new_list.append(clean_data(item))
        return new_list

    # Dictionnaire
    elif isinstance(obj, dict):
        new_dict = {}
        for k, v in obj.items():
            if TARGET in str(v):
                removed_count += 1
            else:
                new_dict[k] = clean_data(v)
        return new_dict

    return obj


# --- Fichiers ---
input_file = "finance_dataset_final.json"
output_file = "cleaned_datatset.json"

with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

cleaned_data = clean_data(data)

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(cleaned_data, f, indent=4, ensure_ascii=False)

print("Nettoyage terminé ✔")
print(f"Nombre d'entrées supprimées : {removed_count}")