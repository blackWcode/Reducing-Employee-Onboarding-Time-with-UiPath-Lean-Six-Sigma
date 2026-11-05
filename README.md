<p align="center">
  <img src="futuracore_logo.png" alt="FuturaCore logo (fictional company)" width="260"/>
</p>

<h1 align="center">HR Onboarding Process Improvement</h1>

<p align="center">
  <strong>Lean Six Sigma (DMAIC) · Python analysis · UiPath automation · Power BI KPIs</strong><br>
  Cutting a 90-minute manual onboarding process towards a target of under 45 minutes.
</p>

<p align="center">
  🌐 <a href="https://blackwcode.github.io/Reducing-Employee-Onboarding-Time-with-UiPath-Lean-Six-Sigma/"><strong>Interactive project website</strong></a>
  &nbsp;·&nbsp; 📓 <a href="./hr_onboarding_analysis.ipynb">Notebook</a>
  &nbsp;·&nbsp; 📊 <a href="./realistic_hr_onboarding_data.xlsx">Dataset</a>
  &nbsp;·&nbsp; 🖥 <a href="./View%20DMAIC%20Presentation">DMAIC presentation</a>
</p>

> **Note:** FuturaCore Ltd. and its onboarding data are **simulated** for this portfolio project. The figures in *Key findings* come from that dataset. The improvements are **business case targets**, not measured results.

---

## 🏢 The problem

**FuturaCore Ltd.** is a mid-sized tech company with 600+ employees across **Dublin, Cork and Limerick**. HR manages onboarding by hand, using emails, Excel trackers and shared folders, and each onboarding takes about **1 hour 30 minutes per employee**.

- Inconsistent task tracking
- Frequent delays and data entry errors
- No central visibility of where each new hire stands

##  Objectives

-  Map the current process with Lean tools (SIPOC, fishbone)
-  Analyse 600 onboarding cases to find bottlenecks
-  Design UiPath automation for the repetitive steps
-  Define Power BI KPIs to monitor the process

##  Business case targets

| Metric | Before | Target |
|---|---|---|
| Onboarding time | 90+ min | **< 45 min** |
| Task automation | 0% | **≥ 50%** |
| Step delay rate | ~15% | **< 5%** |
| Dashboards & KPIs | None | **Live tracking** |

---

##  Approach: DMAIC

| Phase | What was done |
|---|---|
| **Define** | Business case, problem statement and the four targets above |
| **Measure** | SIPOC of the end-to-end process; 600 cases recorded across 8 steps with status, delay reason and processing time |
| **Analyze** | Python analysis of processing time, step status, offices and delay correlation; fishbone of root causes |
| **Improve** | UiPath automation of emails, folder creation and Excel tracker updates, documented in a Process Design Document (current vs. future flow, inputs, outputs, exceptions, business rules) |
| **Control** | Control plan from daily automated checklists to quarterly SOP reviews, with a Power BI dashboard for average time, delays and errors |

<details>
<summary><strong>SIPOC</strong></summary>

| Suppliers | Inputs | Process | Outputs | Customers |
|---|---|---|---|---|
| New hire | Personal documents (ID, address, tax) | Receive, verify and check documents | System credentials | Internal HR team |
| IT / systems admin | Reference check data | Enter data, review credentials | Employee activated | New employee |
| Hiring manager | Policies and regulatory requirements | Compliance and background checks | Access to internal systems | IT and security teams |
| Compliance team | Job details, contract templates | Generate and track offer letter | Signed contract | Manager and line of business |
| HR department | Email and provisioning platforms | Provision accounts, folders, roles | Email, apps and folders ready | Department teams |

</details>

<details>
<summary><strong>Root causes (fishbone)</strong></summary>

- **Materials:** duplicate documents requested; missing or incomplete forms; heavy reliance on manual follow-ups
- **People:** no standardised training; limited tech awareness among HR staff; unclear task ownership
- **Process:** no central checklist or SOP; redundant steps across locations; delays waiting on document approvals
- **Technology:** no automation tools initially; manual Excel entries with frequent errors

</details>

<details>
<summary><strong>Control plan</strong></summary>

| Area | Control activity | Frequency | Owner |
|---|---|---|---|
|  Task completion | Automated UiPath checklist with completion logs | Daily | HR officers |
|  Dashboard monitoring | Power BI KPIs: avg time, delays, errors | Weekly | HR manager |
|  Data validation | Spot-check onboarding data entries | Biweekly | QA specialist |
|  Feedback loop | HR team feedback on bottlenecks and new errors | Monthly | HR lead |
|  Training & SOP review | Update the process guide and checklist | Quarterly | L&D coordinator |

</details>

---

##  Key findings

From the 600 cases in `realistic_hr_onboarding_data.xlsx`:

| Finding | Value |
|---|---|
| Average processing time | **90.4 min** (median 91.1) |
| Cases taking 75–105 min | **55%** |
| Cases over 120 min | **44** (2 over 150 min) |
| Step entries delayed | **15.6%** |
| Step entries with an error | **4.9%** |
| Cases with no delay or error in any step | **15.8%** |

- **Most delayed steps:** Vetting (26.3%) and Documents (24.8%). Folder setup is the least delayed (8.2%).
- **Delay reasons** are spread fairly evenly: reference issues (91), contract errors (89), vetting not done (86), policy delays (84), missing documents (78) and emails not sent (77).
- **Offices** are very similar on average: Cork 89.8 min, Dublin 90.5, Limerick 90.9.
- **Delays in different steps are almost uncorrelated** (between −0.10 and 0.08), so delays are isolated by task, which makes them good targets for step-level automation.

###  Distribution of processing time
![Processing time histogram](./Distribution%20of%20Processing%20Time.png)
> Most onboardings take **75–105 minutes**, centred around 90. The right tail reaches **150+ minutes**, pointing to bottlenecks worth controlling.

###  Correlation between delays in onboarding steps
![Correlation heatmap](./Correlation%20Between%20Delays%20in%20Onboarding%20Steps.png)
> Weak correlations suggest delays are isolated by task, which is ideal for targeted automation.

---

##  Dataset

- **File:** `realistic_hr_onboarding_data.xlsx` (600 simulated cases, start dates Oct 2024 – Apr 2025)
- **Steps tracked (Completed / Delayed / Error):** Offer Letter, Documents, References, Policies, Vetting, Contract, Folder, Final Email
- **Other fields:** Department (6), Office (3), HR Officer (10), Delay Reason, Processing Time (min)

##  Python notebook

`hr_onboarding_analysis.ipynb` (pandas, Matplotlib, Seaborn):

1. Load and inspect the data; check missing values and duplicates
2. Clean column names
3. Processing time distribution (histogram)
4. Completion rate for each step
5. Average processing time by office
6. Correlation heatmap of delayed steps
7. Export a cleaned CSV

An HTML export with the outputs is in [`View Python Analysis`](./View%20Python%20Analysis).

**Run it locally:**
```bash
pip install pandas openpyxl matplotlib seaborn jupyter
jupyter notebook hr_onboarding_analysis.ipynb
```

---

##  My contributions

1. **Process analysis (DMAIC):** defined the pain points, measured delays and cycle times, analysed root causes and error trends, and recommended automation and monitoring KPIs.
2. **Data analysis (Python):** cleaned and explored the onboarding data and built the visual insights.
3. **Process Design Document:** documented current vs. future automated flows, inputs, outputs, exceptions and business rules, and mapped the steps for UiPath.
4. **Dashboard design (Power BI):** designed KPIs for completion rates, step-level delays, average time saved and automation impact.

## 🛠 Tools

**Lean Six Sigma** (DMAIC, SIPOC, fishbone, control plan) · **Python** (pandas, Matplotlib, Seaborn) · **UiPath** (RPA) · **Power BI** · **Excel**

##  Repository contents

| File | Contents |
|---|---|
| `hr_onboarding_analysis.ipynb` | Python analysis notebook |
| `View Python Analysis` / `Python Jupyter.html` | HTML export of the notebook with outputs |
| `realistic_hr_onboarding_data.xlsx` | Simulated dataset (600 cases) |
| `View DMAIC Presentation` | DMAIC slide deck (OpenDocument presentation) |
| `*.png` | Charts used in this README |
| `index.html`, `style.css`, `script.js`, `data.js` | Project website (GitHub Pages) |

