import json
from datetime import datetime
from google.genai import types
from utils.rag_utils import initialize_gemini_client
import pandas as pd
from io import StringIO
from pathlib import Path
import os

# Configuration for saving extracted rules
EXTRACTED_RULES_DIR = "extracted_rules_json"  # Directory to save JSON files
ENABLE_AUTO_SAVE = True  # Set to False to disable auto-saving

def ensure_rules_directory():
    """Create the extracted_rules directory if it doesn't exist."""
    Path(EXTRACTED_RULES_DIR).mkdir(exist_ok=True)

def generate_filename(file_type: str) -> str:
    """Generate a unique filename for the extracted rules."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]  # Include milliseconds
    return f"rules_{file_type.replace('.', '')}_{timestamp}.json"

def save_extracted_rules(rules_data: dict, filename: str) -> str:
    """
    Save extracted rules to a JSON file.
    
    Args:
        rules_data (dict): The extracted rules data
        filename (str): The filename to save to
    
    Returns:
        str: The full path where the file was saved
    """
    try:
        ensure_rules_directory()
        file_path = os.path.join(EXTRACTED_RULES_DIR, filename)
        
        # Add save metadata to the rules data
        rules_data_with_metadata = {
            **rules_data,
            "save_metadata": {
                "saved_at": datetime.now().isoformat(),
                "filename": filename,
                "file_path": file_path
            }
        }
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(rules_data_with_metadata, f, indent=2, ensure_ascii=False)
        
        return file_path
    except Exception as e:
        print(f"Warning: Failed to save extracted rules to {filename}: {e}")
        return None
    
def extract_rules(document_content: str, file_type: str) -> dict:
    """
    Extracts business rules from the given document content.

    Args:
        document_content (str): The content of the document.
        file_type (str): The type of the file (e.g., '.csv', '.pdf', '.txt').

    Returns:
        dict: A dictionary containing the extraction results.
    """
    client = initialize_gemini_client()
    model_name = "gemini-2.0-flash-001"

    # Generate the appropriate prompt based on the file type
    prompt = _create_prompt(document_content, file_type)

    try:
        # Call the Gemini model to generate content
        response = client.models.generate_content(
            model=model_name,
            contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        response_text = response.text.strip()

        # Clean and parse the response
        if response_text.startswith('```json'):
            response_text = response_text.replace('```json', '').replace('```', '').strip()
        elif response_text.startswith('```'):
            response_text = response_text.replace('```', '').strip()

        rules_data = json.loads(response_text)
        # Prepare the result
        result = {
            "success": True,
            "rules": rules_data.get("rules", []),
            "metadata": rules_data.get("configuration_metadata", {}),
            "extraction_timestamp": datetime.now().isoformat()
        }
        
        # Auto-save the extracted rules if enabled
        if ENABLE_AUTO_SAVE:
            filename = generate_filename(file_type)
            saved_path = save_extracted_rules(rules_data, filename)
            if saved_path:
                result["saved_to"] = saved_path
                result["filename"] = filename
                print(f"✅ Extracted rules saved to: {saved_path}")
            else:
                print("⚠️ Failed to save extracted rules")
        
        return result
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": f"JSON parsing error: {e}",
            "details": f"Response text: {response_text[:500]}...",
            "raw_response": response_text[:1000]
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error extracting rules: {e}"
        }

def _create_prompt(content: str, file_type: str) -> str:
    """
    Creates a prompt based on the file type.

    Args:
        content (str): The content of the document.
        file_type (str): The type of the file (e.g., '.csv', '.pdf', '.txt').

    Returns:
        str: The generated prompt.
    """
    if file_type == ".csv":
        return _create_csv_prompt(content)
    elif file_type == ".pdf":
        return _create_pdf_prompt(content)
    else:
        return _create_text_prompt(content)

def _create_csv_prompt(content: str) -> str:
    """Creates a prompt for extracting rules from CSV content."""
    
    # Extract metadata from the CSV content
    try:
        # Parse the CSV content to extract metadata
        df = pd.read_csv(StringIO(content))
        columns = df.columns.tolist()
        row_count = len(df)
    except Exception:
        # Fallback if parsing fails
        lines = content.strip().split('\n')
        columns = lines[0].split(',') if lines else []
        row_count = len(lines) - 1 if len(lines) > 1 else 0
    
    return f"""
You are an expert at extracting CONFIGURABLE business rules from CSV data.

CSV Information:
- Columns: {', '.join(columns)}
- Row Count: {row_count}

Data Content:
{content}

Extract business rules as CONFIGURABLE TEMPLATES that can be customized per client:

{{
    "rules": [
        {{
            "rule_id": "RULE_001",
            "name": "extract_from_rule_name_column",
            "type": "configurable_business_rule",
            "description": "from_rule_description_column",
            "rule_template": "Create template with {{{{parameters}}}}",
            "parameters": {{
                "param_name": {{
                    "current_value": "from_variables_column",
                    "configurable_by": ["client_type", "industry"],
                    "description": "why this parameter varies"
                }}
            }},
            "applies_to": "from_applies_to_table_column",
            "configuration_contexts": [
                {{
                    "context": "infer_from_description",
                    "description": "why would client customize this"
                }}
            ]
        }}
    ],
    "configuration_metadata": {{
        "source": "csv_configurable_extraction"
    }}
}}

Return ONLY valid JSON with no markdown formatting.
"""

def _create_pdf_prompt(content: str) -> str:
    """Creates a prompt for extracting rules from PDF content."""
    return f"""
You are an expert business rules consultant specializing in extracting CONFIGURABLE business rules that can be customized per client, industry, and region.

Analyze this document and identify business rules with their CONFIGURABLE PARAMETERS, not just fixed values.

Document Content:
{content}

Extract business rules as CONFIGURABLE TEMPLATES. For each table/constraint, identify:

1. **Rule Template**: The logic pattern that stays constant
2. **Parameters**: Values that change per client/industry  
3. **Configuration Context**: When/why parameters would change
4. **Validation Rules**: Constraints on parameter values

Output format:

{{
    "rules": [
        {{
            "rule_id": "RULE_001",
            "name": "restaurant_size_classification",
            "type": "configurable_classification",
            "category": "staffing",
            "description": "Classify restaurant size based on employee count with industry-specific thresholds",
            "rule_template": "IF employees <= {{small_max}} THEN 'Small' ELSE IF employees <= {{medium_max}} THEN 'Medium' ELSE IF employees <= {{large_max}} THEN 'Large'",
            "parameters": {{
                "small_max": {{
                    "current_value": 4,
                    "type": "integer",
                    "description": "Maximum employees for small restaurant classification",
                    "configurable_by": ["industry_type", "franchise_model", "local_regulations"],
                    "typical_ranges": {{
                        "fast_food": "3-6",
                        "casual_dining": "4-8", 
                        "fine_dining": "5-10"
                    }},
                    "validation": {{
                        "min": 1,
                        "max": 15,
                        "must_be_less_than": "medium_max"
                    }}
                }},
                "medium_max": {{
                    "current_value": 7,
                    "type": "integer", 
                    "description": "Maximum employees for medium restaurant classification",
                    "configurable_by": ["industry_type", "franchise_model", "local_regulations"],
                    "typical_ranges": {{
                        "fast_food": "6-10",
                        "casual_dining": "8-15",
                        "fine_dining": "10-20"
                    }},
                    "validation": {{
                        "min": 2,
                        "max": 30,
                        "must_be_greater_than": "small_max",
                        "must_be_less_than": "large_max"
                    }}
                }},
                "large_max": {{
                    "current_value": 9,
                    "type": "integer",
                    "description": "Maximum employees for large restaurant classification", 
                    "configurable_by": ["industry_type", "franchise_model", "local_regulations"],
                    "typical_ranges": {{
                        "fast_food": "10-15",
                        "casual_dining": "15-25",
                        "fine_dining": "20-40"
                    }},
                    "validation": {{
                        "min": 3,
                        "max": 100,
                        "must_be_greater_than": "medium_max"
                    }}
                }}
            }},
            "configuration_contexts": [
                {{
                    "context": "industry_adaptation",
                    "description": "Different industries have different optimal team sizes",
                    "examples": ["Fast food needs smaller teams", "Fine dining needs larger specialized teams"]
                }},
                {{
                    "context": "regional_compliance", 
                    "description": "Labor laws and minimum staffing requirements vary by region",
                    "examples": ["EU labor regulations", "State minimum wage laws affecting staffing"]
                }},
                {{
                    "context": "franchise_standards",
                    "description": "Different franchise models have different operational requirements",
                    "examples": ["Corporate standards", "Franchisee flexibility"]
                }}
            ],
            "business_impact": {{
                "affects": ["labor_costs", "operational_efficiency", "compliance"],
                "kpis": ["cost_per_employee", "service_speed", "customer_satisfaction"]
            }},
            "table_source": "tamaño (Size)",
            "extraction_confidence": 0.95
        }},
        {{
            "rule_id": "RULE_002",
            "name": "sales_based_staffing_allocation", 
            "type": "configurable_allocation",
            "category": "staffing",
            "description": "Allocate staff based on sales volume with configurable brackets",
            "rule_template": "FOR each sales_bracket IN sales_brackets: IF sales >= bracket.min AND sales < bracket.max THEN staff_count = bracket.employees",
            "parameters": {{
                "sales_brackets": {{
                    "current_value": "extract_from_table",
                    "type": "array_of_ranges",
                    "description": "Sales ranges with corresponding employee allocations",
                    "configurable_by": ["market_size", "seasonal_patterns", "business_model"],
                    "structure": {{
                        "min_sales": "number",
                        "max_sales": "number", 
                        "employee_count": "number"
                    }},
                    "validation": {{
                        "no_gaps": true,
                        "no_overlaps": true,
                        "ascending_order": true
                    }}
                }}
            }},
            "configuration_contexts": [
                {{
                    "context": "market_adaptation",
                    "description": "Sales volumes vary significantly by market size and location"
                }},
                {{
                    "context": "seasonal_adjustments",
                    "description": "Staffing needs change with seasonal sales patterns"
                }}
            ],
            "table_source": "ventas-totales (Total Sales)",
            "extraction_confidence": 0.90
        }}
    ],
    "configuration_metadata": {{
        "total_rules": 0,
        "source": "configurable_extraction",
        "extraction_method": "parameter_identification",
        "industries_applicable": ["restaurant", "retail", "hospitality"],
        "customization_complexity": "medium",
        "recommended_review_cycle": "quarterly"
    }}
}}

CRITICAL INSTRUCTIONS:
1. **Identify Parameters**: Every number/threshold that could vary by client
2. **Configuration Contexts**: WHY would these parameters change?
3. **Validation Rules**: What constraints ensure parameters make business sense?
4. **Industry Variations**: How do different industries use different values?
5. **Business Impact**: What business outcomes are affected by these parameters?

Extract rules for EVERY table/constraint found. Make them industry-agnostic templates.

Return ONLY valid JSON with no markdown formatting.
"""


def _create_text_prompt(content: str) -> str:
    """Creates a prompt for extracting rules from plain text content."""
    return f"""
Extract CONFIGURABLE business rules from this document.

Document Content:
{content[:3000]}

Extract rules that can be customized per client/industry:

{{
    "rules": [
        {{
            "rule_id": "RULE_001",
            "name": "configurable_rule_name",
            "type": "configurable_business_rule",
            "rule_template": "Template with {{parameters}}",
            "parameters": {{
                "param_name": {{
                    "current_value": "extracted_value",
                    "configurable_by": ["client", "industry"],
                    "validation": {{"min": 0, "max": 100}}
                }}
            }}
        }}
    ]
}}

Return ONLY valid JSON with no markdown formatting.
"""