import os
import google.generativeai as genai

API_KEY = os.getenv('GOOGLE_API_KEY')

genai.configure(api_key=API_KEY)

model = genai.GenerativeModel('gemini-pro')
chat = model.start_chat()
end_chat = False

try:
    while True:
        print()
        contentType = input('Content Type: ')
        contentObjective = input('Content Objective: ')
        studentSegment = input('Student Segment (a/b/c): ')

        if (studentSegment == 'a'):
            studentSegment = 'a student segment primarily with: engineering academic background, active social life, relatively short professional experience, with preference for humanities and arts'
		
        referenceReading = input('Reference Article: ')
        acceptanceCriteria = input('Acceptance Criteria: ')
        userMessage = (f'create content for a {contentType}, acting as an instructor gathering responses from students, with the objective of {contentObjective}, targeted towards {studentSegment}, with {referenceReading} as a reference article, and {acceptanceCriteria} as acceptance criteria')
        response = chat.send_message(userMessage)
        print()
        print(f"Content: {response.text}")
        if end_chat: break
except KeyboardInterrupt:
    print('Ended chat with Keyboard Interrupt')
    end_chat = True
