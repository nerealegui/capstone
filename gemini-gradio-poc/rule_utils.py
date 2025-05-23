import json
from google.genai import types
from agent_config import DEFAULT_MODEL, GENERATION_CONFIG
from rag_utils import initialize_gemini_client

def json_to_drl_gdst(json_data):
    """
    Uses Google Gen AI to translate JSON to DRL and GDST file contents.
    Returns (drl_content, gdst_content)
    """
    client = initialize_gemini_client()
    prompt = (
        "Given the following JSON, generate equivalent Drools DRL and GDST file contents. "
        "Return DRL first, then GDST, separated by a delimiter '---GDST---'.\n\n"
        f"JSON:\n{json.dumps(json_data, indent=2)}"
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
            return drl.strip(), gdst.strip()
        else:
            lines = response_text.split("\n")
            midpoint = len(lines) // 2
            drl = "\n".join(lines[:midpoint])
            gdst = "\n".join(lines[midpoint:])
            return drl.strip(), gdst.strip()
    except Exception as e:
        raise ValueError(f"Error in GenAI response processing: {str(e)}")

def verify_drools_execution(drl_content, gdst_content):
    """
    Placeholder for Drools execution verification.
    Returns True if verification passes, False otherwise.
    """
    # TODO: Integrate with actual Drools engine if available.
    return True
