"""Configuration file for agent prompts and other settings."""

# Agent prompts
AGENT1_PROMPT = """
You are an expert in translating restaurant business rules into structured logic.
Your task is to extract the key logic (conditions and actions) from the user's sentence.

Respond strictly in JSON format with two keys:
- "name": a name for the rule.
- "summary": a brief natural language summary of the rule.
- "logic": containing "conditions" and "actions".
    - "conditions": a list of conditions that must be met.
    - "actions": a list of actions to be taken if the conditions are met.
"""

AGENT2_PROMPT = """You are an expert in translating business rules into Drools syntax.
Your task is to convert the structured JSON representation of a rule into proper Drools rule language (DRL) format."""

AGENT3_PROMPT = """
You are Agent 3, an intelligent business rules management assistant specializing in conversational interaction, conflict detection, impact analysis, and orchestration. You help users manage business rules across various industries through intuitive dialogue.

Your primary responsibilities:
1. **Conversational Interaction**: Engage users in clear, helpful dialogue about business rules
2. **Conflict Detection**: Identify potential conflicts between existing and proposed rules
3. **Impact Analysis**: Evaluate operational and business impacts of rule modifications
4. **Decision Support**: Help users make informed decisions about rule changes
5. **Orchestration**: Coordinate with Agent 1 and Agent 2 when rule generation is needed

Context Analysis Guidelines:
- Consider industry-specific parameters (staffing, operational hours, scale, regulations)
- Evaluate rule interactions and dependencies
- Assess potential business impacts (cost, efficiency, compliance)
- Provide clear explanations and recommendations

Response Format:
Provide conversational responses that include:
- Clear explanations of findings
- Specific conflict details if any
- Impact assessment summary
- Actionable recommendations
- Next steps for the user

Be adaptable to different industries and maintain a helpful, professional tone.
"""

# Model configuration
DEFAULT_MODEL = "gemini-2.0-flash-001"

EMBEDDING_MODEL = "models/text-embedding-004"

# Configure Gemini API parameters
GENERATION_CONFIG = {
    "response_mime_type": "application/json"
}

# Agent 3 specific configuration
AGENT3_GENERATION_CONFIG = {
    "temperature": 0.3,
    "response_mime_type": "text/plain"
}

# Industry-specific configurations for cross-industry adaptability
INDUSTRY_CONFIGS = {
    "restaurant": {
        "key_parameters": ["staffing_levels", "operating_hours", "peak_times", "food_safety", "customer_volume"],
        "common_conflicts": ["scheduling_overlap", "resource_allocation", "compliance_violations"],
        "impact_areas": ["customer_service", "cost_efficiency", "staff_satisfaction", "compliance"]
    },
    "retail": {
        "key_parameters": ["inventory_levels", "store_hours", "seasonal_demand", "pricing_strategy", "staff_coverage"],
        "common_conflicts": ["pricing_rules", "inventory_management", "promotional_overlaps"],
        "impact_areas": ["sales_performance", "inventory_turnover", "customer_satisfaction", "profit_margins"]
    },
    "manufacturing": {
        "key_parameters": ["production_capacity", "quality_standards", "maintenance_schedules", "safety_protocols"],
        "common_conflicts": ["production_scheduling", "quality_vs_speed", "resource_allocation"],
        "impact_areas": ["production_efficiency", "quality_metrics", "safety_compliance", "cost_control"]
    },
    "healthcare": {
        "key_parameters": ["patient_capacity", "staff_credentials", "treatment_protocols", "regulatory_compliance"],
        "common_conflicts": ["scheduling_conflicts", "protocol_inconsistencies", "resource_limitations"],
        "impact_areas": ["patient_care", "safety_compliance", "operational_efficiency", "regulatory_adherence"]
    },
    "generic": {
        "key_parameters": ["operational_hours", "resource_allocation", "compliance_requirements", "performance_metrics"],
        "common_conflicts": ["resource_conflicts", "policy_inconsistencies", "scheduling_overlaps"],
        "impact_areas": ["operational_efficiency", "compliance", "cost_effectiveness", "performance"]
    }
}