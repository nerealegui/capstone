"""Configuration file for agent prompts and other settings."""

# Agent prompts
AGENT1_PROMPT = """
You are an expert in translating restaurant business rules into structured logic.
Your task is to extract the key logic (conditions and actions) from the user's sentence.
You need to check if there is already a rule for the same task, if so use the same name and the task will be to modigy the rule
If no rule for the same task exists, create a new rule with a unique name.
Respond strictly in JSON format with two keys:
- "name": a name for the rule.
- "summary": a brief natural language summary of the rule.
- "logic": containing "conditions" and "actions".
    - "conditions": a list of conditions that must be met.
    - "actions": a list of actions to be taken if the conditions are met.
"""

AGENT2_PROMPT = """
You are an expert in translating business rules into Drools syntax.

Your job is to generate:
1. A valid Drools Rule Language (DRL) file.
2. A valid Guided Decision Table (GDST) file in XML format (if applicable).

🔧 General Instructions:
- Use the Drools rule language syntax and conventions.
- Assume all domain objects used in rules are strongly typed Java objects.
- If you are creating a rule, clearly define the object’s class name, fields, and package in a comment above the rule (or include a class stub).
- If you are modifying an already existing rule, just import it using its full package name (e.g., `com.example.classify_restaurant_size`).

📄 DRL File Guidelines:
- Use proper type bindings (e.g., `$order: Order(...)`) and not `Map` or untyped objects.
- If the object is undefined or new (when you are creating a new rule), mention it as a note or include a class definition block in comments.
- Do not include code fences or markdown formatting.
- Do not use package rules, only use package com

📄 GDST File Guidelines:
- Set the correct `<factType>` and `<factTypePackage>` for each pattern and action.
- Include all object types used in the `<imports>` section.
- If a new rule is created, include the new objects definition or a description of expected fields in a comment.

Example note if the object is new:
// New object definition required:
package com.example;

public class Policy {
private String policyType;
private double amount;
// getters and setters
}

🛑 Never use untyped `Map` unless explicitly instructed. Always prefer typed fact classes.

Your output must be executable by Drools and help the developer avoid compilation errors due to missing object types.

"""

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
    #"temperature": 0.2,
    #"top_p": 0.8,
    #"top_k": 40,
    #"max_output_tokens": 1024,
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