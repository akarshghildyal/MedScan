// ─────────────────────────────────────────────────────────────────────────────
// MEDSCAN DEMO DATA
// This file contains all synthetic data for demo accounts.
// It is used exclusively when isDemoUser() returns true.
// Real user data and API calls are never affected by this file.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_EMAILS = [
    'akarsh@medscan.demo',
    'priya@medscan.demo',
    'david@medscan.demo',
    'collins@medscan.demo',
    'patel@medscan.demo',
    'admin@medscan.demo',
    'dev@medscan.demo',
];

export function isDemoUser(email: string): boolean {
    return DEMO_EMAILS.includes(email.toLowerCase().trim());
}

export const DEMO_DATA: Record<string, any> = {
    'akarsh@medscan.demo': {
        reports: [
            {
                id: 'demo-a1',
                filename: 'CBC_Jan2026_Akarsh.pdf',
                type: 'Complete Blood Count',
                status: 'ANALYZED',
                upload_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Your blood test shows an elevated White Blood Cell count of 13.2 x10⁹/L, which is above the normal upper limit of 11.0. This may suggest a mild inflammatory response or early-stage infection. All other markers including Hemoglobin and Platelets are within healthy ranges.",
                detailed_explanation: "The White Blood Cell (WBC) count is the primary concern in this report. Elevated WBC is medically referred to as leukocytosis and can result from infection, inflammation, stress response, or in some cases bone marrow conditions. Your count of 13.2 is moderately elevated — not in the severe range, but worth monitoring. Neutrophils are also slightly elevated at 72%, which is consistent with a bacterial inflammatory response. All red blood cell parameters — RBC, Hemoglobin, Hematocrit, and MCV — are well within normal ranges, indicating no signs of anemia. Platelet count is healthy, suggesting normal clotting function.",
                insights: ["WBC is elevated at 13.2 x10⁹/L — 20% above the reference maximum of 11.0.", "Neutrophil percentage of 72% suggests possible bacterial infection or inflammatory response.", "No indicators of anemia — Hemoglobin and RBC counts are stable and within range.", "Platelet count is healthy — normal clotting function indicated."],
                markers: [
                    {
                        name: 'WBC', value: 13.2, unit: 'x10⁹/L', ref_min: 4.0, ref_max: 11.0, status: 'HIGH',
                        trend: [
                            { date: '2025-09-15', value: 9.1, status: 'NORMAL' },
                            { date: '2025-11-18', value: 11.8, status: 'HIGH' },
                            { date: '2026-01-08', value: 13.2, status: 'HIGH' },
                        ]
                    },
                    { name: 'RBC', value: 5.1, unit: 'x10¹²/L', ref_min: 4.5, ref_max: 5.9, status: 'NORMAL', trend: [{ date: '2026-01-08', value: 5.1, status: 'NORMAL' }] },
                    { name: 'Hemoglobin', value: 148, unit: 'g/L', ref_min: 130, ref_max: 175, status: 'NORMAL', trend: [{ date: '2026-01-08', value: 148, status: 'NORMAL' }] },
                    { name: 'Hematocrit', value: 0.44, unit: 'L/L', ref_min: 0.40, ref_max: 0.52, status: 'NORMAL', trend: [{ date: '2026-01-08', value: 0.44, status: 'NORMAL' }] },
                    { name: 'MCV', value: 86, unit: 'fL', ref_min: 80, ref_max: 100, status: 'NORMAL', trend: [{ date: '2026-01-08', value: 86, status: 'NORMAL' }] },
                    { name: 'Platelets', value: 242, unit: 'x10⁹/L', ref_min: 150, ref_max: 400, status: 'NORMAL', trend: [{ date: '2026-01-08', value: 242, status: 'NORMAL' }] },
                    { name: 'Neutrophils', value: 72, unit: '%', ref_min: 45, ref_max: 70, status: 'HIGH', trend: [{ date: '2026-01-08', value: 72, status: 'HIGH' }] },
                ],
                shared_with: [{ doctor: 'Dr. Sarah Collins', reviewed: true, reviewed_at: 'Jan 10, 2026' }, { doctor: 'Dr. Raj Patel', reviewed: false, reviewed_at: null }],
            },
            {
                id: 'demo-a2',
                filename: 'Lipid_Profile_Dec2025_Akarsh.pdf',
                type: 'Lipid Panel',
                status: 'ANALYZED',
                upload_date: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Your lipid panel reveals significantly elevated cardiovascular risk markers. Total Cholesterol of 267 mg/dL and LDL of 178 mg/dL are both in the critical range. HDL (good cholesterol) is below the healthy threshold. These findings indicate elevated cardiovascular risk and immediate medical consultation is strongly recommended.",
                detailed_explanation: "This lipid panel presents a concerning picture of cardiovascular health. Total Cholesterol at 267 mg/dL exceeds the desirable threshold of 200 mg/dL by 33%. LDL cholesterol — often referred to as 'bad cholesterol' — is at 178 mg/dL against a recommended maximum of 100 mg/dL, placing it in the high risk category. Elevated LDL contributes to arterial plaque formation, increasing the risk of atherosclerosis, coronary artery disease, and stroke over time. HDL cholesterol at 38 mg/dL is below the protective threshold of 40 mg/dL. Low HDL reduces the body's ability to clear excess cholesterol from the bloodstream. Triglycerides at 210 mg/dL are above the normal maximum of 150 mg/dL, which is associated with metabolic syndrome and increased cardiovascular risk. The combination of high LDL, low HDL, and high Triglycerides in a single panel is a significant clinical finding requiring immediate follow-up with a physician.",
                insights: ["CRITICAL: Total Cholesterol at 267 mg/dL is 33% above the safe maximum of 200 mg/dL.", "CRITICAL: LDL at 178 mg/dL is 78% above the recommended maximum — significant cardiovascular risk.", "HDL (protective cholesterol) is below the healthy minimum of 40 mg/dL.", "Triglycerides are elevated — associated with metabolic syndrome risk.", "Immediate medical consultation is strongly recommended."],
                markers: [
                    { name: 'Total Cholesterol', value: 267, unit: 'mg/dL', ref_min: 0, ref_max: 200, status: 'CRITICAL', trend: [{ date: '2025-12-01', value: 267, status: 'CRITICAL' }] },
                    { name: 'LDL', value: 178, unit: 'mg/dL', ref_min: 0, ref_max: 100, status: 'CRITICAL', trend: [{ date: '2025-12-01', value: 178, status: 'CRITICAL' }] },
                    { name: 'HDL', value: 38, unit: 'mg/dL', ref_min: 40, ref_max: 60, status: 'LOW', trend: [{ date: '2025-12-01', value: 38, status: 'LOW' }] },
                    { name: 'Triglycerides', value: 210, unit: 'mg/dL', ref_min: 0, ref_max: 150, status: 'HIGH', trend: [{ date: '2025-12-01', value: 210, status: 'HIGH' }] },
                    { name: 'VLDL', value: 42, unit: 'mg/dL', ref_min: 0, ref_max: 30, status: 'HIGH', trend: [{ date: '2025-12-01', value: 42, status: 'HIGH' }] },
                ],
                shared_with: [{ doctor: 'Dr. Sarah Collins', reviewed: true, reviewed_at: 'Dec 4, 2025' }, { doctor: 'Dr. Raj Patel', reviewed: false, reviewed_at: null }],
            },
            {
                id: 'demo-a3',
                filename: 'CBC_Nov2025_Akarsh.pdf',
                type: 'Complete Blood Count',
                status: 'ANALYZED',
                upload_date: new Date(Date.now() - 68 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Your CBC shows a mildly elevated White Blood Cell count of 11.8 x10⁹/L, just above the normal upper limit. All other markers are within normal ranges.",
                detailed_explanation: "WBC is marginally elevated at 11.8, just crossing the upper reference limit of 11.0. This is a mild elevation and may reflect a passing infection or temporary immune response at the time of the test. All other CBC parameters are normal.",
                insights: ["WBC mildly elevated at 11.8 x10⁹/L — just above the reference maximum.", "All other markers within normal limits — no anemia indicators."],
                markers: [
                    { name: 'WBC', value: 11.8, unit: 'x10⁹/L', ref_min: 4.0, ref_max: 11.0, status: 'HIGH', trend: [{ date: '2025-09-15', value: 9.1, status: 'NORMAL' }, { date: '2025-11-18', value: 11.8, status: 'HIGH' }] },
                    { name: 'RBC', value: 5.0, unit: 'x10¹²/L', ref_min: 4.5, ref_max: 5.9, status: 'NORMAL', trend: [{ date: '2025-11-18', value: 5.0, status: 'NORMAL' }] },
                    { name: 'Hemoglobin', value: 145, unit: 'g/L', ref_min: 130, ref_max: 175, status: 'NORMAL', trend: [{ date: '2025-11-18', value: 145, status: 'NORMAL' }] },
                    { name: 'Hematocrit', value: 0.43, unit: 'L/L', ref_min: 0.40, ref_max: 0.52, status: 'NORMAL', trend: [{ date: '2025-11-18', value: 0.43, status: 'NORMAL' }] },
                    { name: 'MCV', value: 87, unit: 'fL', ref_min: 80, ref_max: 100, status: 'NORMAL', trend: [{ date: '2025-11-18', value: 87, status: 'NORMAL' }] },
                    { name: 'Platelets', value: 228, unit: 'x10⁹/L', ref_min: 150, ref_max: 400, status: 'NORMAL', trend: [{ date: '2025-11-18', value: 228, status: 'NORMAL' }] },
                    { name: 'Neutrophils', value: 68, unit: '%', ref_min: 45, ref_max: 70, status: 'NORMAL', trend: [{ date: '2025-11-18', value: 68, status: 'NORMAL' }] },
                ],
                shared_with: [],
            },
            {
                id: 'demo-a4',
                filename: 'CBC_Sep2025_Akarsh.pdf',
                type: 'Complete Blood Count',
                status: 'ANALYZED',
                upload_date: new Date(Date.now() - 128 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Your CBC results are all within normal reference ranges. No abnormal markers detected.",
                detailed_explanation: "All parameters in this Complete Blood Count are within their respective reference ranges. WBC, RBC, Hemoglobin, Hematocrit, MCV, and Platelets are all healthy. This report serves as a good baseline for future comparisons.",
                insights: ["All CBC markers are within normal reference ranges.", "No abnormalities detected — this is a healthy baseline result."],
                markers: [
                    { name: 'WBC', value: 9.1, unit: 'x10⁹/L', ref_min: 4.0, ref_max: 11.0, status: 'NORMAL', trend: [{ date: '2025-09-15', value: 9.1, status: 'NORMAL' }] },
                    { name: 'RBC', value: 5.2, unit: 'x10¹²/L', ref_min: 4.5, ref_max: 5.9, status: 'NORMAL', trend: [{ date: '2025-09-15', value: 5.2, status: 'NORMAL' }] },
                    { name: 'Hemoglobin', value: 151, unit: 'g/L', ref_min: 130, ref_max: 175, status: 'NORMAL', trend: [{ date: '2025-09-15', value: 151, status: 'NORMAL' }] },
                    { name: 'Hematocrit', value: 0.45, unit: 'L/L', ref_min: 0.40, ref_max: 0.52, status: 'NORMAL', trend: [{ date: '2025-09-15', value: 0.45, status: 'NORMAL' }] },
                    { name: 'MCV', value: 88, unit: 'fL', ref_min: 80, ref_max: 100, status: 'NORMAL', trend: [{ date: '2025-09-15', value: 88, status: 'NORMAL' }] },
                    { name: 'Platelets', value: 235, unit: 'x10⁹/L', ref_min: 150, ref_max: 400, status: 'NORMAL', trend: [{ date: '2025-09-15', value: 235, status: 'NORMAL' }] },
                    { name: 'Neutrophils', value: 62, unit: '%', ref_min: 45, ref_max: 70, status: 'NORMAL', trend: [{ date: '2025-09-15', value: 62, status: 'NORMAL' }] },
                ],
                shared_with: [],
            },
            {
                id: 'demo-a5',
                filename: 'LFT_Feb2026_Akarsh.pdf',
                type: 'Liver Function Test',
                status: 'ANALYZED',
                upload_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Your liver function test shows mildly elevated liver enzymes — ALT and AST are above normal ranges. Albumin is slightly low. These findings may indicate mild hepatic stress and should be discussed with your doctor.",
                detailed_explanation: "ALT (Alanine Aminotransferase) at 72 U/L is above the normal maximum of 56 U/L. ALT is an enzyme primarily found in liver cells; elevated levels indicate liver cell damage or stress. AST (Aspartate Aminotransferase) at 61 U/L is above its normal maximum of 40 U/L. When both ALT and AST are elevated simultaneously, this is a stronger indicator of hepatic involvement. The ALT:AST ratio of approximately 1.2 is consistent with non-alcoholic fatty liver disease or medication-induced hepatitis. ALP and Bilirubin are within normal ranges, suggesting the bile duct system is functioning normally. Albumin at 3.1 g/dL is mildly below the normal minimum of 3.5 g/dL, indicating slightly reduced liver synthetic function.",
                insights: ["ALT elevated at 72 U/L — 29% above the normal maximum of 56 U/L.", "AST elevated at 61 U/L — consistent with mild hepatic stress when combined with elevated ALT.", "GGT elevated — may indicate liver inflammation or enzyme induction.", "Albumin slightly below normal — mild reduction in liver synthetic function.", "Bile duct markers (ALP, Bilirubin) are normal — obstruction is unlikely."],
                markers: [
                    { name: 'ALT', value: 72, unit: 'U/L', ref_min: 7, ref_max: 56, status: 'HIGH', trend: [{ date: '2026-02-06', value: 72, status: 'HIGH' }] },
                    { name: 'AST', value: 61, unit: 'U/L', ref_min: 10, ref_max: 40, status: 'HIGH', trend: [{ date: '2026-02-06', value: 61, status: 'HIGH' }] },
                    { name: 'ALP', value: 88, unit: 'U/L', ref_min: 44, ref_max: 147, status: 'NORMAL', trend: [{ date: '2026-02-06', value: 88, status: 'NORMAL' }] },
                    { name: 'Bilirubin Total', value: 1.1, unit: 'mg/dL', ref_min: 0.2, ref_max: 1.2, status: 'NORMAL', trend: [{ date: '2026-02-06', value: 1.1, status: 'NORMAL' }] },
                    { name: 'Albumin', value: 3.1, unit: 'g/dL', ref_min: 3.5, ref_max: 5.0, status: 'LOW', trend: [{ date: '2026-02-06', value: 3.1, status: 'LOW' }] },
                    { name: 'Total Protein', value: 6.8, unit: 'g/dL', ref_min: 6.3, ref_max: 8.2, status: 'NORMAL', trend: [{ date: '2026-02-06', value: 6.8, status: 'NORMAL' }] },
                    { name: 'GGT', value: 68, unit: 'U/L', ref_min: 9, ref_max: 48, status: 'HIGH', trend: [{ date: '2026-02-06', value: 68, status: 'HIGH' }] },
                ],
                shared_with: [{ doctor: 'Dr. Sarah Collins', reviewed: false, reviewed_at: null }],
            },
            {
                id: 'demo-a6',
                filename: 'Thyroid_Profile_Oct2025_Akarsh.pdf',
                type: 'Thyroid Profile',
                status: 'ANALYZED',
                upload_date: new Date(Date.now() - 98 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Your thyroid function tests are all within normal reference ranges. No thyroid abnormalities detected.",
                detailed_explanation: "TSH (Thyroid Stimulating Hormone) at 2.4 mIU/L is well within the normal range of 0.4–4.0 mIU/L, indicating normal pituitary-thyroid feedback. Free T3 and Free T4 are both within their respective normal ranges, confirming normal thyroid hormone production and conversion. This is a reassuringly normal thyroid panel.",
                insights: ["All thyroid markers are within normal reference ranges.", "TSH is normal — no signs of hypo or hyperthyroidism.", "This is a healthy thyroid panel result."],
                markers: [
                    { name: 'TSH', value: 2.4, unit: 'mIU/L', ref_min: 0.4, ref_max: 4.0, status: 'NORMAL', trend: [{ date: '2025-10-03', value: 2.4, status: 'NORMAL' }] },
                    { name: 'Free T3', value: 3.8, unit: 'pg/mL', ref_min: 2.3, ref_max: 4.2, status: 'NORMAL', trend: [{ date: '2025-10-03', value: 3.8, status: 'NORMAL' }] },
                    { name: 'Free T4', value: 1.2, unit: 'ng/dL', ref_min: 0.8, ref_max: 1.8, status: 'NORMAL', trend: [{ date: '2025-10-03', value: 1.2, status: 'NORMAL' }] },
                    { name: 'T3 Total', value: 118, unit: 'ng/dL', ref_min: 80, ref_max: 200, status: 'NORMAL', trend: [{ date: '2025-10-03', value: 118, status: 'NORMAL' }] },
                    { name: 'T4 Total', value: 8.2, unit: 'µg/dL', ref_min: 5.1, ref_max: 14.1, status: 'NORMAL', trend: [{ date: '2025-10-03', value: 8.2, status: 'NORMAL' }] },
                ],
                shared_with: [],
            },
        ],
        metrics: {
            totalReports: 6,
            lastUpload: '2 days ago',
            abnormalMarkers: 8,
        },
        chatHistory: {
            'demo-a1': [
                { role: 'user', content: 'What does it mean that my WBC is high?', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString() },
                { role: 'assistant', content: 'Your White Blood Cell count of 13.2 x10⁹/L is above the normal range of 4.0–11.0 x10⁹/L. WBC are your immune system\'s soldiers — elevated counts often indicate your body is fighting something, such as a bacterial infection, viral illness, or inflammatory condition. In your case, the elevation is moderate rather than severe. Combined with your elevated Neutrophil percentage of 72%, this pattern is most consistent with a bacterial or inflammatory response. Importantly, all your other markers — Hemoglobin, RBC, and Platelets — are completely normal. I\'d recommend discussing this result with your doctor, particularly if you\'ve been experiencing any symptoms like fever, fatigue, or persistent pain. Please note this is informational only and not a medical diagnosis.', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString() },
                { role: 'user', content: 'Should I be worried?', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString() },
                { role: 'assistant', content: 'A WBC of 13.2 is a moderate elevation — not in the range that would typically indicate an emergency, but definitely worth a conversation with your doctor. The reassuring part of your results is that everything else looks healthy. Your Hemoglobin is normal, ruling out anemia. Your Platelets are normal, ruling out clotting issues. The elevation is isolated to your white cells and neutrophils, which is a more common and often temporary finding. If this is your first elevated WBC result, your doctor may recommend a repeat test in a few weeks to see if it resolves on its own. Remember — I can help you understand your results, but your doctor is the right person to assess what action, if any, is needed.', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 6 * 60 * 1000).toISOString() },
            ],
            'demo-a2': [
                { role: 'user', content: 'Is my cholesterol dangerous?', timestamp: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString() },
                { role: 'assistant', content: 'Your lipid panel shows some values that require medical attention. Your Total Cholesterol is 267 mg/dL — the recommended maximum is 200 mg/dL, placing your result 33% above the safe threshold. More concerning is your LDL cholesterol at 178 mg/dL, against a recommended maximum of 100 mg/dL. LDL is often called "bad cholesterol" because high levels contribute to the buildup of fatty plaques in your arteries, which over time can restrict blood flow and increase the risk of heart attack and stroke. Your HDL at 38 mg/dL is also below the healthy minimum of 40 mg/dL. This combination of results — high Total Cholesterol, high LDL, low HDL, and high Triglycerides — is a significant clinical finding. I would strongly recommend consulting your doctor promptly. This is not a medical diagnosis, but these values do indicate elevated cardiovascular risk that warrants professional evaluation.', timestamp: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000 + 4 * 60 * 1000).toISOString() },
                { role: 'user', content: 'What foods should I avoid?', timestamp: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000 + 6 * 60 * 1000).toISOString() },
                { role: 'assistant', content: 'Based on your lipid panel results, general dietary guidance for managing high cholesterol typically includes reducing: saturated fats (found in red meat, full-fat dairy, butter, and coconut oil), trans fats (found in fried foods and packaged baked goods), and refined carbohydrates and added sugars which contribute to elevated Triglycerides. Foods generally associated with improved lipid profiles include: oily fish like salmon and mackerel, soluble fibre from oats and lentils, nuts especially almonds and walnuts, and olive oil in place of saturated fats. However, dietary guidance should always be personalised by your doctor or a registered dietitian. Please treat this as general information and not a personalised medical recommendation.', timestamp: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString() },
            ],
        },
    },

    'priya@medscan.demo': {
        reports: [
            {
                id: 'demo-p1',
                filename: 'CBC_Jan2026_Priya.pdf',
                type: 'Complete Blood Count',
                status: 'ANALYZED',
                upload_date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Your blood test shows signs of mild anemia. Hemoglobin at 102 g/L and RBC at 3.8 x10¹²/L are both below the normal range for women. MCV is slightly elevated, which combined with low hemoglobin may suggest a nutritional deficiency. Please consult your doctor.",
                detailed_explanation: "Hemoglobin at 102 g/L is below the female normal minimum of 120 g/L. Hemoglobin is the protein inside red blood cells responsible for carrying oxygen from your lungs to every cell in your body. When hemoglobin is low, your tissues receive less oxygen than they need — causing the classic symptoms of anemia including fatigue, weakness, shortness of breath, and difficulty concentrating. RBC count of 3.8 x10¹²/L is below the female normal minimum of 4.2 x10¹²/L, consistent with the low hemoglobin finding. MCV at 102 fL is above the normal maximum of 100 fL, indicating macrocytosis — larger than normal red blood cells. This pattern of low hemoglobin with high MCV is called macrocytic anemia and is most commonly caused by Vitamin B12 or folate deficiency. Both are essential nutrients for proper red blood cell production. Your doctor will likely recommend a B12 and folate blood test to confirm the cause.",
                insights: ["Hemoglobin at 102 g/L is below the female normal minimum of 120 g/L — indicative of mild anemia.", "RBC count is below normal for women — consistent with hemoglobin finding.", "Elevated MCV with low hemoglobin suggests macrocytic anemia — possible B12 or folate deficiency.", "WBC and Platelets are normal — no signs of infection or clotting disorder."],
                markers: [
                    { name: 'WBC', value: 6.2, unit: 'x10⁹/L', ref_min: 4.0, ref_max: 11.0, status: 'NORMAL', trend: [{ date: '2026-01-16', value: 6.2, status: 'NORMAL' }] },
                    { name: 'RBC', value: 3.8, unit: 'x10¹²/L', ref_min: 4.2, ref_max: 5.4, status: 'LOW', trend: [{ date: '2026-01-16', value: 3.8, status: 'LOW' }] },
                    { name: 'Hemoglobin', value: 102, unit: 'g/L', ref_min: 120, ref_max: 160, status: 'LOW', trend: [{ date: '2026-01-16', value: 102, status: 'LOW' }] },
                    { name: 'Hematocrit', value: 0.31, unit: 'L/L', ref_min: 0.37, ref_max: 0.47, status: 'LOW', trend: [{ date: '2026-01-16', value: 0.31, status: 'LOW' }] },
                    { name: 'MCV', value: 102, unit: 'fL', ref_min: 80, ref_max: 100, status: 'HIGH', trend: [{ date: '2026-01-16', value: 102, status: 'HIGH' }] },
                    { name: 'Platelets', value: 318, unit: 'x10⁹/L', ref_min: 150, ref_max: 400, status: 'NORMAL', trend: [{ date: '2026-01-16', value: 318, status: 'NORMAL' }] },
                    { name: 'Neutrophils', value: 58, unit: '%', ref_min: 45, ref_max: 70, status: 'NORMAL', trend: [{ date: '2026-01-16', value: 58, status: 'NORMAL' }] },
                ],
                shared_with: [{ doctor: 'Dr. Sarah Collins', reviewed: false, reviewed_at: null }, { doctor: 'Dr. Raj Patel', reviewed: false, reviewed_at: null }],
            },
            {
                id: 'demo-p2',
                filename: 'Lipid_Profile_Dec2025_Priya.pdf',
                type: 'Lipid Panel',
                status: 'ANALYZED',
                upload_date: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Your lipid panel is mostly within normal ranges, with LDL slightly above the recommended maximum. Total Cholesterol, HDL, and Triglycerides are all normal.",
                detailed_explanation: "LDL cholesterol at 118 mg/dL slightly exceeds the recommended maximum of 100 mg/dL. While this is a borderline elevation rather than a critical finding, it is worth monitoring through diet and lifestyle adjustments. Total Cholesterol at 188 mg/dL is within the desirable range. HDL at 52 mg/dL is at a healthy level, which is protective against cardiovascular disease. Triglycerides at 112 mg/dL are well within the normal range.",
                insights: ["LDL slightly elevated at 118 mg/dL — borderline, not critical, but worth monitoring.", "HDL is at a healthy level — good cardiovascular protection.", "All other lipid markers are within normal ranges."],
                markers: [
                    { name: 'Total Cholesterol', value: 188, unit: 'mg/dL', ref_min: 0, ref_max: 200, status: 'NORMAL', trend: [{ date: '2025-12-15', value: 188, status: 'NORMAL' }] },
                    { name: 'LDL', value: 118, unit: 'mg/dL', ref_min: 0, ref_max: 100, status: 'HIGH', trend: [{ date: '2025-12-15', value: 118, status: 'HIGH' }] },
                    { name: 'HDL', value: 52, unit: 'mg/dL', ref_min: 40, ref_max: 60, status: 'NORMAL', trend: [{ date: '2025-12-15', value: 52, status: 'NORMAL' }] },
                    { name: 'Triglycerides', value: 112, unit: 'mg/dL', ref_min: 0, ref_max: 150, status: 'NORMAL', trend: [{ date: '2025-12-15', value: 112, status: 'NORMAL' }] },
                    { name: 'VLDL', value: 22, unit: 'mg/dL', ref_min: 0, ref_max: 30, status: 'NORMAL', trend: [{ date: '2025-12-15', value: 22, status: 'NORMAL' }] },
                ],
                shared_with: [],
            },
            {
                id: 'demo-p3',
                filename: 'KFT_Feb2026_Priya.pdf',
                type: 'Kidney Function Test',
                status: 'PROCESSING',
                upload_date: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
                summary: null,
                detailed_explanation: null,
                insights: [],
                markers: [],
                shared_with: [],
            },
        ],
        metrics: {
            totalReports: 3,
            lastUpload: '12 minutes ago',
            abnormalMarkers: 3,
        },
        chatHistory: {
            'demo-p1': [
                { role: 'user', content: 'What does low hemoglobin mean?', timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString() },
                { role: 'assistant', content: 'Your Hemoglobin level of 102 g/L is below the normal range for women, which is 120–160 g/L. Hemoglobin is the protein inside red blood cells responsible for carrying oxygen from your lungs to every cell in your body. When hemoglobin is low, your tissues receive less oxygen than they need, which causes the classic symptoms of anemia — fatigue, weakness, shortness of breath, dizziness, and difficulty concentrating. Your result also shows a low RBC count and a slightly elevated MCV of 102 fL. This combination — low hemoglobin with large red blood cells — is called macrocytic anemia and is most commonly caused by a deficiency in Vitamin B12 or folate. Both are essential nutrients for proper red blood cell production. The good news is that nutritional deficiency anemias are very treatable once the underlying deficiency is identified and corrected. Your doctor will likely recommend a B12 and folate blood test to confirm the cause. Please do not self-supplement without medical guidance.', timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000 + 6 * 60 * 1000).toISOString() },
            ],
        },
    },

    'david@medscan.demo': {
        reports: [
            {
                id: 'demo-d1',
                filename: 'Urine_Analysis_Feb2026_David.pdf',
                type: 'Unknown',
                status: 'FAILED',
                upload_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                summary: null,
                detailed_explanation: null,
                insights: [],
                markers: [],
                error_message: "Failed to parse PDF document. The file may be corrupted, password-protected, or contain non-machine-readable text. Please re-upload a valid machine-readable PDF.",
                shared_with: [],
            },
            {
                id: 'demo-d2',
                filename: 'CBC_Jan2026_David.pdf',
                type: 'Complete Blood Count',
                status: 'ANALYZED',
                upload_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Your CBC results are all within normal reference ranges. No abnormal markers detected. This is a healthy blood count result.",
                detailed_explanation: "All Complete Blood Count parameters are within normal reference ranges. WBC, RBC, Hemoglobin, Hematocrit, MCV, and Platelets are all healthy. No signs of anemia, infection, or clotting abnormality.",
                insights: ["All CBC markers are within normal reference ranges.", "No abnormalities detected."],
                markers: [
                    { name: 'WBC', value: 7.4, unit: 'x10⁹/L', ref_min: 4.0, ref_max: 11.0, status: 'NORMAL', trend: [{ date: '2026-01-08', value: 7.4, status: 'NORMAL' }] },
                    { name: 'RBC', value: 5.0, unit: 'x10¹²/L', ref_min: 4.5, ref_max: 5.9, status: 'NORMAL', trend: [{ date: '2026-01-08', value: 5.0, status: 'NORMAL' }] },
                    { name: 'Hemoglobin', value: 144, unit: 'g/L', ref_min: 130, ref_max: 175, status: 'NORMAL', trend: [{ date: '2026-01-08', value: 144, status: 'NORMAL' }] },
                    { name: 'Hematocrit', value: 0.43, unit: 'L/L', ref_min: 0.40, ref_max: 0.52, status: 'NORMAL', trend: [{ date: '2026-01-08', value: 0.43, status: 'NORMAL' }] },
                    { name: 'MCV', value: 89, unit: 'fL', ref_min: 80, ref_max: 100, status: 'NORMAL', trend: [{ date: '2026-01-08', value: 89, status: 'NORMAL' }] },
                    { name: 'Platelets', value: 261, unit: 'x10⁹/L', ref_min: 150, ref_max: 400, status: 'NORMAL', trend: [{ date: '2026-01-08', value: 261, status: 'NORMAL' }] },
                    { name: 'Neutrophils', value: 60, unit: '%', ref_min: 45, ref_max: 70, status: 'NORMAL', trend: [{ date: '2026-01-08', value: 60, status: 'NORMAL' }] },
                ],
                shared_with: [],
            },
        ],
        metrics: {
            totalReports: 2,
            lastUpload: '1 day ago',
            abnormalMarkers: 0,
        },
        chatHistory: {},
    },

    'collins@medscan.demo': {
        queue: [
            {
                id: 'demo-a2',
                patientName: 'Akarsh Mehta',
                patientId: 'PT-AKR-001',
                reportType: 'Lipid Panel',
                dateShared: '38 days ago',
                markersFlagged: 4,
                highestSeverity: 'CRITICAL',
                reviewed: true,
                reviewedAt: 'Dec 4, 2025',
            },
            {
                id: 'demo-a5',
                patientName: 'Akarsh Mehta',
                patientId: 'PT-AKR-001',
                reportType: 'Liver Function Test',
                dateShared: '2 days ago',
                markersFlagged: 3,
                highestSeverity: 'HIGH',
                reviewed: false,
                reviewedAt: null,
            },
            {
                id: 'demo-a1',
                patientName: 'Akarsh Mehta',
                patientId: 'PT-AKR-001',
                reportType: 'Complete Blood Count',
                dateShared: '8 days ago',
                markersFlagged: 2,
                highestSeverity: 'HIGH',
                reviewed: true,
                reviewedAt: 'Jan 10, 2026',
            },
            {
                id: 'demo-p1',
                patientName: 'Priya Sharma',
                patientId: 'PT-PRI-002',
                reportType: 'Complete Blood Count',
                dateShared: '22 days ago',
                markersFlagged: 4,
                highestSeverity: 'LOW',
                reviewed: false,
                reviewedAt: null,
            },
        ],
        assignedPatients: [
            {
                id: 'PT-AKR-001',
                patientName: 'Akarsh Mehta',
                patientEmail: 'akarsh@medscan.demo',
                assignedAt: '38 days ago',
                reportCount: 3,
            },
            {
                id: 'PT-PRI-002',
                patientName: 'Priya Sharma',
                patientEmail: 'priya@medscan.demo',
                assignedAt: '22 days ago',
                reportCount: 1,
            }
        ],
        metrics: {
            totalShared: 4,
            criticalReports: 1,
            pendingReview: 2,
        },
    },

    'patel@medscan.demo': {
        queue: [
            {
                id: 'demo-a2',
                patientName: 'Akarsh Mehta',
                patientId: 'PT-AKR-001',
                reportType: 'Lipid Panel',
                dateShared: '38 days ago',
                markersFlagged: 4,
                highestSeverity: 'CRITICAL',
                reviewed: false,
                reviewedAt: null,
            },
            {
                id: 'demo-a1',
                patientName: 'Akarsh Mehta',
                patientId: 'PT-AKR-001',
                reportType: 'Complete Blood Count',
                dateShared: '8 days ago',
                markersFlagged: 2,
                highestSeverity: 'HIGH',
                reviewed: false,
                reviewedAt: null,
            },
            {
                id: 'demo-p1',
                patientName: 'Priya Sharma',
                patientId: 'PT-PRI-002',
                reportType: 'Complete Blood Count',
                dateShared: '22 days ago',
                markersFlagged: 4,
                highestSeverity: 'LOW',
                reviewed: false,
                reviewedAt: null,
            },
        ],
        assignedPatients: [
            {
                id: 'PT-PRI-002',
                patientName: 'Priya Sharma',
                patientEmail: 'priya@medscan.demo',
                assignedAt: '22 days ago',
                reportCount: 1,
            }
        ],
        metrics: {
            totalShared: 3,
            criticalReports: 1,
            pendingReview: 3,
        },
    },

    'admin@medscan.demo': {
        patients: [
            { id: 'PT-AKR-001', name: 'Akarsh Mehta', email: 'akarsh@medscan.demo', assignedDoctors: ['Dr. Sarah Collins'], hospitalId: 'MEDCORE-001' },
            { id: 'PT-PRI-002', name: 'Priya Sharma', email: 'priya@medscan.demo', assignedDoctors: ['Dr. Sarah Collins', 'Dr. Raj Patel'], hospitalId: 'MEDCORE-001' },
            { id: 'PT-DAV-003', name: 'David Lim', email: 'david@medscan.demo', assignedDoctors: [], hospitalId: 'MEDCORE-001' },
        ],
        doctors: [
            { id: 'DR-COL-001', name: 'Dr. Sarah Collins', email: 'collins@medscan.demo', specialization: 'Internal Medicine', assignedPatients: 2, hospitalId: 'MEDCORE-001' },
            { id: 'DR-PAT-002', name: 'Dr. Raj Patel', email: 'patel@medscan.demo', specialization: 'Cardiology', assignedPatients: 1, hospitalId: 'MEDCORE-001' },
        ],
        metrics: {
            totalPatients: 3,
            totalDoctors: 2,
            activeAssignments: 3,
        },
    },

    'dev@medscan.demo': {
        pipeline: [
            {
                filename: 'CBC_Jan2026_Akarsh.pdf',
                uploadedAt: '10 mins ago',
                status: 'ANALYZED',
                rawJson: {
                    pipeline_version: '1.0.0',
                    report_id: 'demo-a1',
                    agents_completed: ['pdf_parser', 'medical_data_extraction', 'abnormality_detection', 'insight_generation', 'detailed_explanation', 'summary'],
                    pdf_parser: { status: 'success', pages_extracted: 2, char_count: 3842 },
                    medical_data_extraction: { status: 'success', markers_found: 7, report_type: 'Complete Blood Count' },
                    abnormality_detection: { status: 'success', abnormal_count: 2, normal_count: 5 },
                    insight_generation: { status: 'success', insights_generated: 4 },
                    detailed_explanation: { status: 'success', word_count: 187 },
                    summary: { status: 'success', word_count: 52 },
                    summary_text: 'Your blood test shows an elevated White Blood Cell count...',
                    processing_time_ms: 14320,
                },
            },
            {
                filename: 'Urine_Analysis_Feb2026_David.pdf',
                uploadedAt: '20 mins ago',
                status: 'FAILED',
                rawJson: {
                    pipeline_version: '1.0.0',
                    report_id: 'demo-d1',
                    agents_completed: ['pdf_parser'],
                    agents_failed: ['medical_data_extraction'],
                    pdf_parser: { status: 'success', pages_extracted: 1, char_count: 0 },
                    medical_data_extraction: { status: 'failed', error: 'No extractable text found in document. File may be a scanned image or corrupted PDF.', markers_found: 0 },
                    processing_time_ms: 2100,
                },
            },
        ],
    },
};

// Map the full report objects to the doctors queues to keep the data DRY
DEMO_DATA['collins@medscan.demo'].queue[0].report = DEMO_DATA['akarsh@medscan.demo'].reports[1];
DEMO_DATA['collins@medscan.demo'].queue[1].report = DEMO_DATA['akarsh@medscan.demo'].reports[4];
DEMO_DATA['collins@medscan.demo'].queue[2].report = DEMO_DATA['akarsh@medscan.demo'].reports[0];
DEMO_DATA['collins@medscan.demo'].queue[3].report = DEMO_DATA['priya@medscan.demo'].reports[0];

DEMO_DATA['patel@medscan.demo'].queue[0].report = DEMO_DATA['akarsh@medscan.demo'].reports[1];
DEMO_DATA['patel@medscan.demo'].queue[1].report = DEMO_DATA['akarsh@medscan.demo'].reports[0];
DEMO_DATA['patel@medscan.demo'].queue[2].report = DEMO_DATA['priya@medscan.demo'].reports[0];

DEMO_DATA['dev@medscan.demo'].pipeline[0].rawJson.markers = DEMO_DATA['akarsh@medscan.demo'].reports[0].markers;
DEMO_DATA['dev@medscan.demo'].pipeline[0].rawJson.insights = DEMO_DATA['akarsh@medscan.demo'].reports[0].insights;
