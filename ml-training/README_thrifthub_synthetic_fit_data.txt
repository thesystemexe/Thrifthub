THRIFTHUB SYNTHETIC FIT TRAINING DATA
====================================

Files:
- thrifthub_synthetic_fit_training_3000.csv: 3,000 synthetic rows.
- train_thrifthub_fit_model.py: scikit-learn training example.

IMPORTANT LIMITATIONS
- Every row is synthetic and generated from invented distributions and
  heuristic rules. None are real customer feedback.
- fit_outcome labels are simulated. A model trained on this file will mainly
  learn the simulation, not actual real-world garment fit.
- Use these files to test data cleaning, model training, serialization, and
  integration in a development environment. Do not claim real-world accuracy
  or deploy without validation on representative, consented real feedback.
- Measurements use inches. Blank means not applicable/not supplied, not zero.
- Body chest and shoulder are included for tops; body waist and inseam for
  bottoms. Height is included for all rows but is not used by the label rule.
- The tag size is included as a feature but not used by the synthetic label
  rule, because tag labels vary between brands and second-hand garments.
- Data is generic simulation, not based on your actual product catalogue.

Run:
  python -m pip install pandas scikit-learn joblib
  python train_thrifthub_fit_model.py
