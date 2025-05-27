import pytest
import json
from gemini-gradio-poc.chat_app import json_to_drl_gdst, verify_drools_execution

def test_json_to_drl_gdst(monkeypatch):
    class MockResponse:
        text = "rule \"test\"\nwhen\nthen\nend\n---GDST---table content"
    class MockModel:
        def generate_content(self, prompt):
            return MockResponse()
    class MockClient:
        def __init__(self): self.models = self
        def get(self, name): return MockModel()
    monkeypatch.setattr("gemini-gradio-poc.chat_app.initialize_gemini", lambda: MockClient())
    json_data = {"rule": "test"}
    drl, gdst = json_to_drl_gdst(json_data)
    assert "rule" in drl
    assert "table" in gdst

def test_verify_drools_execution():
    assert verify_drools_execution("some drl", "some gdst") is True
