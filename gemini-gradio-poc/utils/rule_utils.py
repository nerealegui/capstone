import json
import os
from pathlib import Path
from google.genai import types
from config.agent_config import DEFAULT_MODEL, GENERATION_CONFIG
from utils.rag_utils import initialize_gemini_client
from utils.rule_versioning import update_rule_version
import re  # Add the regex module

def json_to_drl_gdst(json_data, update_rule_version_info=True, rule_storage_path="data/rules"):
    """
    Uses Google Gen AI to translate JSON to DRL and GDST file contents.
    Updates the original JSON rule with versioning information when DRL/GDST is generated.
    Returns (drl_content, gdst_content)
    
    Args:
        json_data: The JSON rule data
        update_rule_version_info: Whether to update rule versioning info
        rule_storage_path: Path where JSON rules are stored
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
- Import any necessary object types at the top of the DRL file.
- If you are creating a rule, clearly define the object’s class name, fields, and package in a comment above the rule (or include a class stub).
- If you are modifying an already existing rule, just import it using its full package name (e.g., `com.example.Order`).

📄 DRL File Guidelines:
- Add necessary `import` statements at the top.
- Use proper type bindings (e.g., `$order: Order(...)`) and not `Map` or untyped objects.
- If the object is undefined or new (when you are creating a new rule), mention it as a note or include a class definition block in comments.
- Do not include code fences or markdown formatting.

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

        # Update rule versioning information if requested
        if update_rule_version_info and isinstance(json_data, dict):
            _update_rule_json_with_drl_generation(json_data, rule_storage_path)
        
        return drl_content, gdst_content
    except Exception as e:
        raise ValueError(f"Error in GenAI response processing: {str(e)}")

def verify_drools_execution(drl_content, gdst_content):
    """
    Placeholder for Drools execution verification.
    Returns True if verification passes, False otherwise.
    """
    # TODO: Integrate with actual Drools engine if available.
    return True

def _update_rule_json_with_drl_generation(json_data, rule_storage_path):
    """
    Update the JSON rule file with DRL generation information.
    
    Args:
        json_data: The rule data that was used for DRL generation
        rule_storage_path: Path where JSON rules are stored
    """
    rule_id = json_data.get("rule_id")
    if not rule_id:
        return
    
    try:
        # Update rule with versioning info for DRL generation
        updated_rule = update_rule_version(
            json_data.copy(),
            change_type="drl_generation",
            change_summary="Generated DRL and GDST files from JSON rule",
            drl_generated=True
        )
        
        # Try to update the rule in common storage locations
        potential_paths = [
            Path(rule_storage_path) / "extracted_rules.json",
            Path("data") / "extracted_rules.json",
            Path("extracted_rules.json")
        ]
        
        for rules_file in potential_paths:
            if rules_file.exists():
                _update_rule_in_file(rules_file, updated_rule)
                break
        
    except Exception as e:
        print(f"Warning: Could not update rule versioning info: {e}")

def _update_rule_in_file(rules_file_path, updated_rule):
    """
    Update a specific rule in a JSON rules file.
    
    Args:
        rules_file_path: Path to the JSON rules file
        updated_rule: The updated rule data
    """
    try:
        # Read existing rules
        with open(rules_file_path, 'r') as f:
            rules = json.load(f)
        
        # Handle both list of rules and single rule formats
        if isinstance(rules, list):
            # Find and update the rule in the list
            rule_id = updated_rule.get("rule_id")
            for i, rule in enumerate(rules):
                if rule.get("rule_id") == rule_id:
                    rules[i] = updated_rule
                    break
        elif isinstance(rules, dict) and rules.get("rule_id") == updated_rule.get("rule_id"):
            # Single rule file
            rules = updated_rule
        
        # Write back the updated rules
        with open(rules_file_path, 'w') as f:
            json.dump(rules, f, indent=2)
            
    except Exception as e:
        print(f"Error updating rule in file {rules_file_path}: {e}")

def load_rule_with_version_info(rule_id, rule_storage_path="data/rules"):
    """
    Load a rule with its version information.
    
    Args:
        rule_id: The ID of the rule to load
        rule_storage_path: Path where rules are stored
        
    Returns:
        Rule dictionary with version info, or None if not found
    """
    potential_paths = [
        Path(rule_storage_path) / "extracted_rules.json",
        Path("data") / "extracted_rules.json", 
        Path("extracted_rules.json")
    ]
    
    for rules_file in potential_paths:
        if rules_file.exists():
            try:
                with open(rules_file, 'r') as f:
                    rules = json.load(f)
                
                # Handle both list and single rule formats
                if isinstance(rules, list):
                    for rule in rules:
                        if rule.get("rule_id") == rule_id:
                            return rule
                elif isinstance(rules, dict) and rules.get("rule_id") == rule_id:
                    return rules
                    
            except Exception as e:
                print(f"Error loading rule from {rules_file}: {e}")
    
    return None
