import json
import os
from pathlib import Path
from google.genai import types
from config.agent_config import DEFAULT_MODEL, GENERATION_CONFIG
from utils.rag_utils import initialize_gemini_client
import re  # Add the regex module
import string
from collections import OrderedDict

def json_to_drl_gdst(json_data):
    """
    Uses Google Gen AI to translate JSON to DRL and GDST file contents.
    Returns (drl_content, gdst_content)
    
    Args:
        json_data: The JSON rule data
    """
    client = initialize_gemini_client()
    prompt = (
        "Given the following JSON, generate equivalent Drools DRL and GDST file contents. "
        "Return DRL first, then GDST, separated by a delimiter '---GDST---'.\n\n"
        f"JSON:\n{json.dumps(json_data, indent=2)}"
        """ 
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

This is an example of a drl file. When writing it, do not include the ```drl at the beginning AND do not include ''' at the end:

package com;

// New object definition required:
//package com.example;
//public class Restaurant {
//    private String size;
//    // getters and setters
//}
//
// New object definition required:
//package com.example;
//public class Employee {
//    private Restaurant restaurant;
//    // getters and setters
//}

rule "classify_restaurant_size"
    salience 10
    when
        $restaurant : Restaurant( size == "medium" )
    then
        System.out.println("Assigning 5 employees to medium restaurant.");
        for (int i = 0; i < 5; i++) {
            Employee employee = new Employee();
            employee.setRestaurant($restaurant);
            insert(employee);
        }
end

This is an example of a gdst file. Do not include the gdst''' at the beginning AND do not include ``` at the end!!:
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

Do not include any additional text, just return the DRL and GDST contents in the specified format, so I am able to run it with drools directly.
"""
        
    )
    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)]
        )
    ]
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain"
    )
    try:
        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=contents,
            config=generate_content_config,
        )
        if hasattr(response, "text"):
            response_text = response.text
        elif hasattr(response, "parts") and len(response.parts) > 0:
            response_text = response.parts[0].text
        elif hasattr(response, "candidates") and len(response.candidates) > 0:
            response_text = response.candidates[0].content.parts[0].text
        else:
            raise ValueError("Could not extract text from response")
        
        if "---GDST---" in response_text:
            drl, gdst = response_text.split("---GDST---", 1)
            drl_content = drl.strip()
            gdst_content = gdst.strip()
        else:
            lines = response_text.split("\n")
            midpoint = len(lines) // 2
            drl_content = "\n".join(lines[:midpoint]).strip()
            gdst_content = "\n".join(lines[midpoint:]).strip()
        
        # Apply regex cleanup to remove unwanted text
        drl_content = re.sub(r"```drl|```", "", drl_content).strip()
        gdst_content = re.sub(r"```gdst|```", "", gdst_content).strip()

        return drl_content, gdst_content
    except Exception as e:
        raise ValueError(f"Error in GenAI response processing: {str(e)}")

CANONICAL_RULE_FIELDS = [
    "rule_id", "name", "category", "description", "summary",
    "conditions", "actions", "priority", "active"
]
CANONICAL_CONDITION_FIELDS = ["field", "operator", "value"]
CANONICAL_ACTION_FIELDS = ["type", "details"]

FIELD_MAP = {
    "attribute": "field",
    "fact": "field",
}
ACTION_TYPE_MAP = {
    "action_type": "type",
    "assign_employees": "number_employees",
    "assignment": "number_employees",
}
ACTION_DETAILS_MAP = {
    "number_of_employees": "details",
    "value": "details",
}

def normalize_condition(cond):
    norm = OrderedDict()
    # Map alternative keys to canonical
    val = cond.get("field") or cond.get("attribute") or cond.get("fact") or ""
    if val == "restaurant_size":
        val = "size"
    norm["field"] = val
    norm["operator"] = cond.get("operator", "")
    norm["value"] = str(cond.get("value", ""))
    return norm

def normalize_action(act):
    norm = OrderedDict()
    act_type = act.get("type") or act.get("action_type") or ""
    act_type = ACTION_TYPE_MAP.get(act_type, act_type)
    norm["type"] = act_type
    details = act.get("details") or act.get("number_of_employees") or act.get("value") or ""
    norm["details"] = str(details)
    return norm

def normalize_rule_fields(new_rule, canonical_fields=CANONICAL_RULE_FIELDS):
    # Flatten logic if present
    rule = dict(new_rule)
    if "logic" in rule:
        logic = rule.pop("logic")
        if "conditions" in logic:
            rule["conditions"] = logic["conditions"]
        if "actions" in logic:
            rule["actions"] = logic["actions"]

    # Normalize conditions
    norm_conditions = []
    for cond in rule.get("conditions", []):
        norm_conditions.append(normalize_condition(cond))

    # Normalize actions
    norm_actions = []
    for act in rule.get("actions", []):
        norm_actions.append(normalize_action(act))

    # Build ordered rule
    ordered = OrderedDict()
    for field in canonical_fields:
        if field == "conditions":
            ordered["conditions"] = norm_conditions
        elif field == "actions":
            ordered["actions"] = norm_actions
        elif field == "description":
            ordered["description"] = rule.get("description") or rule.get("summary", "")
        elif field == "summary":
            ordered["summary"] = rule.get("summary") or rule.get("description", "")
        elif field == "priority":
            ordered["priority"] = rule.get("priority", "High")
        elif field == "active":
            ordered["active"] = rule.get("active", "TRUE")
        else:
            ordered[field] = rule.get(field, "")
    return ordered

def generate_rule_id(rules, rule_name):
    """Generate a unique rule_id for a given rule name."""
    base = "BR"
    same_name = [r for r in rules if r.get("name") == rule_name]
    if same_name:
        nums = [r["rule_id"] for r in same_name if r.get("rule_id", "").startswith(base)]
        if nums:
            last = sorted(nums)[-1]
            prefix = last[:5]
            suffix = last[5:]
            if suffix and suffix[-1].isalpha():
                next_letter = chr(ord(suffix[-1]) + 1)
            else:
                next_letter = "a"
            return f"{prefix}{next_letter}"
        else:
            return f"{base}001a"
    else:
        nums = [int(r["rule_id"][2:5]) for r in rules if r.get("rule_id", "").startswith(base) and r["rule_id"][2:5].isdigit()]
        next_num = max(nums) + 1 if nums else 1
        return f"{base}{next_num:03d}a"

def update_extracted_rules_json(new_rule: dict, json_path: str = "./extracted_rules.json") -> bool:
    # Load existing rules
    rules = []
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            rules = json.load(f)
    # Normalize new rule
    normalized_rule = normalize_rule_fields(new_rule)
    # Generate rule_id if missing
    if not normalized_rule.get("rule_id"):
        normalized_rule["rule_id"] = generate_rule_id(rules, normalized_rule["name"])
    # Only update if rule_id matches, else append
    updated = False
    for idx, rule in enumerate(rules):
        if rule.get("rule_id") == normalized_rule["rule_id"]:
            rules[idx] = normalized_rule
            updated = True
            break
    if not updated:
        rules.append(normalized_rule)
    # Save back to file
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(rules, f, indent=2, ensure_ascii=False)
    return True

def verify_drools_execution(drl_content, gdst_content):
    """
    Placeholder for Drools execution verification.
    Returns True if verification passes, False otherwise.
    """
    # TODO: Integrate with actual Drools engine if available.
    return True






