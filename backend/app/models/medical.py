from typing import Optional, List
from pydantic import BaseModel, Field

class Biomarker(BaseModel):
    value: Optional[float] = None
    unit: Optional[str] = None
    flag: Optional[str] = None  # 'H' for high, 'L' for low, None for normal
    reference_range: Optional[str] = None

class LipidPanel(BaseModel):
    """Lipid Profile / Cholesterol Test Results"""
    total_cholesterol: Optional[Biomarker] = Field(default=None, description="Total Cholesterol")
    triglycerides: Optional[Biomarker] = Field(default=None, description="Triglycerides")
    hdl_cholesterol: Optional[Biomarker] = Field(default=None, description="HDL (Good) Cholesterol")
    ldl_cholesterol: Optional[Biomarker] = Field(default=None, description="LDL (Bad) Cholesterol")
    vldl_cholesterol: Optional[Biomarker] = Field(default=None, description="VLDL Cholesterol")
    tc_hdl_ratio: Optional[float] = Field(default=None, description="Total Cholesterol/HDL Ratio")

class ThyroidProfile(BaseModel):
    """Thyroid Function Test Results"""
    tsh: Optional[Biomarker] = Field(default=None, description="Thyroid Stimulating Hormone")
    t3_total: Optional[Biomarker] = Field(default=None, description="Total T3")
    t4_total: Optional[Biomarker] = Field(default=None, description="Total T4")
    free_t3: Optional[Biomarker] = Field(default=None, description="Free T3")
    free_t4: Optional[Biomarker] = Field(default=None, description="Free T4")

class UrineAnalysis(BaseModel):
    """Urinalysis / Urine Routine Test Results"""
    color: Optional[str] = None
    appearance: Optional[str] = None
    ph: Optional[float] = None
    specific_gravity: Optional[float] = None
    protein: Optional[str] = None
    glucose: Optional[str] = None
    ketones: Optional[str] = None
    blood: Optional[str] = None
    nitrite: Optional[str] = None
    rbc: Optional[str] = Field(default=None, description="Red Blood Cells per HPF")
    wbc: Optional[str] = Field(default=None, description="White Blood Cells per HPF")
    epithelial_cells: Optional[str] = None

class NutritionalDeficiency(BaseModel):
    """Vitamin and Mineral Deficiency Test Results"""
    vitamin_d: Optional[Biomarker] = Field(default=None, description="25-OH Vitamin D")
    vitamin_b12: Optional[Biomarker] = Field(default=None, description="Vitamin B12")
    iron: Optional[Biomarker] = Field(default=None, description="Serum Iron")
    ferritin: Optional[Biomarker] = Field(default=None, description="Ferritin")
    calcium: Optional[Biomarker] = Field(default=None, description="Calcium")
    hemoglobin: Optional[Biomarker] = Field(default=None, description="Hemoglobin")

class ExtractedReport(BaseModel):
    """Wrapper for extracted medical data"""
    patient_name: Optional[str] = None
    report_date: Optional[str] = None
    lab_name: Optional[str] = None
    lipid_panel: Optional[LipidPanel] = None
    thyroid_profile: Optional[ThyroidProfile] = None
    urine_analysis: Optional[UrineAnalysis] = None
    nutritional_deficiency: Optional[NutritionalDeficiency] = None
