import pandas as pd

df = pd.read_csv(r"C:\Users\ASA\Downloads\CROP REC.csv")

print("Unique Crops:")
print(sorted(df["label"].unique()))

print("\nCrop Counts:")
print(df["label"].value_counts())