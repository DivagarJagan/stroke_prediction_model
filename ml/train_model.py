"""Train the Logistic Regression stroke model and export parameters for the web app.
Run: python3 ml/train_model.py  ->  writes src/lib/ml/model.json
"""
import json, pathlib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = pathlib.Path(__file__).resolve().parent.parent
df = pd.read_csv(ROOT / "ml" / "stroke_data.csv", na_values=["N/A", ""])
raw_total = len(df)
missing_bmi = int(df["bmi"].isna().sum())
unknown_smoking = int((df["smoking_status"] == "Unknown").sum())
df = df.drop(columns=["id"])
df["smoking_status"] = df["smoking_status"].fillna("Unknown")

NUM = ["age", "hypertension", "heart_disease", "avg_glucose_level", "bmi"]
CAT = ["gender", "ever_married", "work_type", "Residence_type", "smoking_status"]
X, y = df[NUM + CAT], df["stroke"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), NUM),
    ("cat", OneHotEncoder(handle_unknown="ignore"), CAT),
])
model = Pipeline([("pre", pre), ("lr", LogisticRegression(max_iter=1000, class_weight="balanced"))])
model.fit(X_tr, y_tr)
pred = model.predict(X_te); proba = model.predict_proba(X_te)[:, 1]
tn, fp, fn, tp = confusion_matrix(y_te, pred).ravel()

num_pipe = model.named_steps["pre"].named_transformers_["num"]
enc = model.named_steps["pre"].named_transformers_["cat"]
lr = model.named_steps["lr"]
coef = lr.coef_[0].tolist()
out = {
    "model": "Logistic Regression",
    "features": {"numerical": NUM, "categorical": CAT},
    "imputer_medians": dict(zip(NUM, num_pipe.named_steps["imp"].statistics_.tolist())),
    "scaler": {"mean": num_pipe.named_steps["sc"].mean_.tolist(), "scale": num_pipe.named_steps["sc"].scale_.tolist()},
    "categories": {c: [str(v) for v in cats] for c, cats in zip(CAT, enc.categories_)},
    "coef": coef, "intercept": float(lr.intercept_[0]),
    "metrics": {
        "accuracy": accuracy_score(y_te, pred), "precision": precision_score(y_te, pred),
        "recall": recall_score(y_te, pred), "f1_score": f1_score(y_te, pred),
        "roc_auc": roc_auc_score(y_te, proba),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
        "train_size": len(X_tr), "test_size": len(X_te),
    },
    "dataset": {
        "total_records": raw_total, "feature_count": len(NUM + CAT),
        "stroke_cases": int((y == 1).sum()), "non_stroke_cases": int((y == 0).sum()),
        "missing_values_handled": {"bmi": missing_bmi, "smoking_status_unknown": unknown_smoking},
        "age_mean": float(df["age"].mean()), "glucose_mean": float(df["avg_glucose_level"].mean()),
        "bmi_mean": float(df["bmi"].mean()),
        "gender_counts": df["gender"].value_counts().to_dict(),
        "smoking_counts": df["smoking_status"].value_counts().to_dict(),
        "stroke_rate_by_age": {b: float(g["stroke"].mean()) for b, g in df.groupby(pd.cut(df["age"], [0,20,40,60,80,120], labels=["0-20","21-40","41-60","61-80","80+"]), observed=False)},
    },
}
(ROOT / "src/lib/ml/model.json").write_text(json.dumps(out, indent=2))
print(json.dumps(out["metrics"], indent=1), out["categories"])
