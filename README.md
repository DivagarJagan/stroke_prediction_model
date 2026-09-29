# Stroke Analysis System

Stroke Analysis System is a web application for exploring stroke-risk data and generating a preliminary, model-based stroke-risk estimate from routine patient health information. It is intended for education, analysis, and screening workflows. It is **not a medical diagnostic tool** and must not replace assessment by a qualified healthcare professional.

The application includes:

- A dashboard with dataset summaries, record distribution, and stroke rate by age group.
- A patient analysis form using age, gender, hypertension, heart disease, marital status, work type, residence, glucose level, BMI, and smoking status.
- A Logistic Regression prediction with an estimated probability and a summary of the submitted inputs.
- Browser-session prediction history; no prediction history is stored in a database.
- Dataset insights covering target distribution, feature counts, and handled missing values.
- Model performance reporting for accuracy, precision, recall, F1 score, ROC AUC, and the confusion matrix.

## Technology Stack

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Vite 8
- Tailwind CSS 4
- Recharts for charts
- Zod for patient-input validation
- React Hook Form and Radix UI components
- Lucide React for icons
- Python, pandas, and scikit-learn for model training

The trained model parameters are exported to `src/lib/ml/model.json`. The web application uses those exported parameters directly for prediction, so Python is only required when retraining or changing the model.

## Requirements

Install these tools before opening the project in VS Code:

To validate the deployment bundle without publishing it:

- Python 3.10 or newer for model training
- Git, if cloning the repository
- Visual Studio Code
- A modern browser such as Chrome, Edge, or Firefox

Check the installed versions in the VS Code integrated terminal:

```powershell
and deploys it whenever `main` is updated.
npm --version
python --version
git --version
```

## Open and Run in VS Code

1. Open VS Code.
2. Select **File > Open Folder** and choose the project folder.
3. Open **Terminal > New Terminal**.
4. Install the frontend packages:

```powershell
npm install
```

1. Start the development server:

```powershell
npm run dev
```

1. Open the local URL printed in the terminal, normally `http://localhost:8081` or the port selected by Vite.

The main routes are:

- `/` - dashboard
- `/analysis` - patient analysis and prediction history
- `/insights` - dataset insights
- `/performance` - model performance
- `/services` - available application services
- `/about` - project information

## Installed Frontend Packages

The frontend packages are declared in `package.json` and installed with `npm install`.

Core application packages include:

- `react`, `react-dom`, and `typescript`
- `@tanstack/react-start`, `@tanstack/react-router`, and `@tanstack/react-query`
- `vite` and `@vitejs/plugin-react`
- `tailwindcss`, `@tailwindcss/vite`, and `tw-animate-css`
- `zod` for runtime validation
- `recharts` for data visualizations
- `react-hook-form` and `@hookform/resolvers` for form handling
- `lucide-react` for interface icons
- `sonner` for notifications
- `date-fns` for date utilities

The project also includes Radix UI packages for accessible interface primitives, including dialogs, menus, forms, popovers, tabs, tooltips, selects, progress indicators, and related controls. Development tooling includes ESLint, Prettier, TypeScript ESLint, and the TanStack/Vite integration.

## Python Model Environment

The Python requirements are stored in `ml/requirements.txt`:

- `pandas` for loading and preparing the CSV dataset
- `scikit-learn` for preprocessing, Logistic Regression, train/test splitting, and evaluation metrics

Create a virtual environment and install the ML packages from the VS Code terminal:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r ml/requirements.txt
```

If PowerShell blocks local script activation, activate the environment from Command Prompt instead:

```bat
.venv\Scripts\activate.bat
```

## Retrain the Model

Retraining is optional when only running the web application. The training script reads `ml/stroke_data.csv`, removes the `id` column, handles missing BMI values, encodes categorical features, trains a class-balanced Logistic Regression model, evaluates it on a stratified held-out set, and writes the result to `src/lib/ml/model.json`.

With the virtual environment activated, run:

```powershell
python ml/train_model.py
```

After retraining, stop and restart the Vite development server so the updated model data is loaded.

## Useful Commands

```powershell
npm run dev          # Start the development server
npm run build        # Create a production build
npm run build:dev   # Create a development-mode build
npm run preview      # Preview the production build locally
npm run lint         # Run ESLint
npm run format       # Format project files with Prettier
```

## Deploy to Vercel

The production target is Vercel. The TanStack Start build uses Nitro's Vercel
preset and generates a complete SSR deployment bundle in `.vercel/output`.

Install the Vercel CLI, authenticate, link the project, and deploy:

```powershell
npm ci
npm install --global vercel
npx vercel login
npx vercel link
npm run deploy
```

To validate the deployment bundle without publishing it:

```powershell
npm run deploy:dry-run
```

Alternatively, import the repository in the Vercel dashboard. Vercel will run
`npm ci`, execute `npm run build`, and publish the generated SSR output.

## Project Structure

```text
ml/
  requirements.txt   Python dependencies
  stroke_data.csv    Training dataset
  train_model.py     Model-training and export script
public/              Static public files
src/
  components/        Shared layout and UI components
  lib/ml/             Exported model and browser prediction logic
  routes/             Dashboard and application pages
  router.tsx          TanStack Router configuration
  styles.css          Global styles
```

## Important Notes

- The displayed metrics are based on the supplied dataset and a 20% stratified test split.
- The model uses median imputation for missing BMI values, standard scaling for numerical features, one-hot encoding for categorical features, and class-balanced Logistic Regression.
- Prediction history is stored only in the current browser session.
- A prediction is a preliminary model estimate, not a diagnosis, treatment recommendation, or clinical validation result.
