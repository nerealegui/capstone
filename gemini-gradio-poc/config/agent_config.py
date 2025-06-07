"""Configuration file for agent prompts and other settings."""

# Agent prompts
AGENT1_PROMPT = """
You are an expert in translating restaurant business rules into structured logic.
Your task is to extract the key logic (conditions and actions) from the user's sentence.
You need to check if there is already a rule for the same task, if so use the same name and the task will be to modigy the rule
If no rule for the same task exists, create a new rule with a unique name.
Respond strictly in JSON format with two keys:
- "name": a name for the rule. Che
- "summary": a brief natural language summary of the rule.
- "logic": containing "conditions" and "actions".
    - "conditions": a list of conditions that must be met.
    - "actions": a list of actions to be taken if the conditions are met.
"""

AGENT2_PROMPT = """You are an expert in translating business rules into Drools syntax.
Your task is to convert the structured JSON representation of a rule into proper Drools rule language (DRL) format.

This is an example of a drl file. When writing it, do not include the drl''' at the beginning and do not include ''' at the end:
package rules;

import java.util.Map;

rule "assign_employees_medium_sales"
    salience 10
    when
        $restaurant : Map( this["restaurant_size"] == "medium", this["sales"] >= 100, this["sales"] <= 200 )
    then
        System.out.println("Assigning 10 employees to medium restaurant.");
        $restaurant.put("number_of_employees", 10);
        update($restaurant);
end

This is an example of a gdst file. Do not include the gdst''' at the beginning and do not include ''' at the end:
<decision-table52>
  <tableName>Assign Employees to Small Restaurants</tableName>
  <rowNumberCol>
    <width>30</width>
    <isUseImportedTypes>false</isUseImportedTypes>
    <header>Row Number</header>
    <hideColumn>false</hideColumn>
  </rowNumberCol>
  <descriptionCol>
    <width>200</width>
    <isUseImportedTypes>false</isUseImportedTypes>
    <header>Description</header>
    <hideColumn>false</hideColumn>
  </descriptionCol>
  <ruleNameCol>
    <width>100</width>
    <isUseImportedTypes>false</isUseImportedTypes>
    <header>Rule Name</header>
    <hideColumn>false</hideColumn>
  </ruleNameCol>
  <metadataCols/>
  <attributeCols>
    <attributeCol>
      <width>100</width>
      <isUseImportedTypes>false</isUseImportedTypes>
      <attribute>salience</attribute>
      <header>Salience</header>
      <hideColumn>false</hideColumn>
    </attributeCol>
  </attributeCols>
  <conditionPatterns>
    <pattern>
      <factType>Restaurant</factType>
      <boundName>restaurant</boundName>
      <isNegated>false</isNegated>
      <window>
        <parameters/>
      </window>
      <fieldConstraints>
        <fieldConstraint>
          <fieldName>size</fieldName>
          <fieldType>String</fieldType>
          <expression>
            <parts/>
            <index>2147483647</index>
          </expression>
          <parameters/>
          <fieldConstraintList/>
        </fieldConstraint>
        <fieldConstraint>
          <fieldName>employees.size</fieldName>
          <fieldType>Integer</fieldType>
          <expression>
            <parts/>
            <index>2147483647</index>
          </expression>
          <parameters/>
          <fieldConstraintList/>
        </fieldConstraint>
      </fieldConstraints>
      <isUseInstanceOf>false</isUseInstanceOf>
      <factTypePackage>com.example</factTypePackage>
      <columnWidth>100</columnWidth>
      <header>Restaurant Size</header>
      <hideColumn>false</hideColumn>
    </pattern>
  </conditionPatterns>
  <actionCols>
    <insertFactCol>
      <factType>Employee</factType>
      <boundName>employee1</boundName>
      <fieldValues>
        <fieldValue>
          <field>restaurant</field>
          <fieldType>Restaurant</fieldType>
          <expression>
            <parts/>
            <index>2147483647</index>
          </expression>
          <parameters/>
        </fieldValue>
      </fieldValues>
      <header>Assign Employee 1</header>
      <hideColumn>false</hideColumn>
      <factTypePackage>com.example</factTypePackage>
    </insertFactCol>
    <insertFactCol>
      <factType>Employee</factType>
      <boundName>employee2</boundName>
      <fieldValues>
        <fieldValue>
          <field>restaurant</field>
          <fieldType>Restaurant</fieldType>
          <expression>
            <parts/>
            <index>2147483647</index>
          </expression>
          <parameters/>
        </fieldValue>
      </fieldValues>
      <header>Assign Employee 2</header>
      <hideColumn>false</hideColumn>
      <factTypePackage>com.example</factTypePackage>
    </insertFactCol>
    <logExecution>
      <header>Log</header>
      <hideColumn>false</hideColumn>
    </logExecution>
  </actionCols>
  <auditLog>
    <filter class="org.drools.guvnor.client.modeldriven.dt52.auditlog.DecisionTableAuditLogFilter">
      <acceptedTypes>
        <entry>
          <string>INSERT_FACT</string>
          <boolean>true</boolean>
        </entry>
        <entry>
          <string>DELETE_FACT</string>
          <boolean>false</boolean>
        </entry>
        <entry>
          <string>MODIFY_FACT</string>
          <boolean>false</boolean>
        </entry>
        <entry>
          <string>RETRACT_FACT</string>
          <boolean>false</boolean>
        </entry>
        <entry>
          <string>ENABLE_RULE</string>
          <boolean>true</boolean>
        </entry>
        <entry>
          <string>DISABLE_RULE</string>
          <boolean>false</boolean>
        </entry>
      </acceptedTypes>
    </filter>
    <entries/>
  </auditLog>
  <imports>
    <imports>
      <java.lang.String>com.example.Restaurant</java.lang.String>
    </imports>
    <imports>
      <java.lang.String>com.example.Employee</java.lang.String>
    </imports>
  </imports>
  <decisionTable>
    <rows>
      <row>
        <entry>1</entry>
        <entry>Assign two employees to small restaurant</entry>
        <entry>Assign Employees to Small Restaurants 1</entry>
        <entry>10</entry>
        <entry>small</entry>
        <entry>&lt; 2</entry>
        <entry>new Employee(restaurant)</entry>
        <entry>new Employee(restaurant)</entry>
        <entry>Assigned 2 employees to small restaurant: restaurant.getName()</entry>
      </row>
    </rows>
  </decisionTable>
</decision-table52>

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