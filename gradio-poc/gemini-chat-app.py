#TODO: Install before running
#pip install gradio
#pip install google.generativeai
#pip install gradio_pdf

# run code - python gemini-chat-app.py

import gradio as gr
import os
import google.generativeai as genai


# Custom theme
theme = gr.themes.Base(
    secondary_hue="gray",
).set(
    border_color_accent_dark='*neutral_800'
)

# Function for Gemini chat


def gemini_chat(message, history, content_type, student_groups, general_acceptance_criteria, student_acceptance_criteria, file):
    # Convert the lists to comma-separated strings
    student_groups_str = ", ".join(student_groups)
    general_acceptance_criteria_str = ", ".join(general_acceptance_criteria)
    # TODO: Implement model.generate_content() function
    response = model.generate_content(
        f"Produce content by rephrasing the following message: `{message}`, utilizing terminology associated with each of these student groups: {student_groups_str}. The objective is to develop {content_type} content. The format for the generated content should adhere strictly to the following criteria: {general_acceptance_criteria_str}. As a student, I expect the generated content to fulfill the following acceptance criteria: {student_acceptance_criteria}"
    )
    return response.text


# Configure generative AI model
API_KEY = os.getenv('GOOGLE_API_KEY') 
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-pro')
chat = model.start_chat()

# Define the main interface
iface = gr.ChatInterface(
    fn=gemini_chat,
    title='IE GenExperience',
    additional_inputs_accordion=gr.Accordion(
        label="Additional Parameters", open=True),
    chatbot=gr.Chatbot(),
    textbox=gr.Textbox(
        placeholder="Message...",
        scale=7
    ),
    undo_btn=None,
    clear_btn=None,
    theme=theme,
    additional_inputs=[
        gr.Dropdown(["Forum", "Lecture", "Exercises"], label="Content Type"),
        gr.CheckboxGroup(["All","Business", "Engineering", "Science", "Humanities"],
                         label="Student Groups", info="What are your student groups?"),
        gr.CheckboxGroup([
            "Ensure that the generated content completely mirrors the main message for each selected student group, adapting the examples to reflect their unique industry and career paths.",
            "Maintain the original length and structure of the text without shortening it or converting paragraphs into bullet points.",
            "Generate distinct texts tailored to each student group provided."
        ], label="General Acceptance Criteria", info="What is the format you want to see in the output?"),
        gr.Textbox(label="Student Acceptance Criteria", info="What acceptance criteria do you see fit?"),
        gr.File(label="Upload Files (Optional)", height=50),
        # gr.Dropdown(["English", "Spanish", "French",
        #             "German"], label="Language"),
        # gr.CheckboxGroup(["Introduction", "Body", "Conclusion"],
        #                  label="Content Sections", info="What are the sections of your content?"),
        # gr.Checkbox(label="Include Citations"),
        # gr.Microphone(label="Record Voice Note"),
    ],
    css = """
        footer {visibility: hidden}
        label[data-testid='block-label'] {visibility: hidden}
        """
)

if __name__ == '__main__':
    iface.launch(share=True)
