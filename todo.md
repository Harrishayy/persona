roles: owner (owns quiz), host, user. 




General pages to add:

- if new user, without usertag, prompt user to add usertag. 

- Settings: add bio, details, change usertags, etc. 

- Find quiz. 

- Your quizzes.

- stats page

- edit quiz

- cool colourcoded slanted back button with nice hover.





Creating Quiz!

- photo/emoji for the quiz (to see in your quizzes!)

- need to add a preview button on making quiz so when clicked, it creates a two col sections, wehre left is editor form and right is preview. 

- allow format of question editing to be in card moving format (so content changes and format remains same) or in scrollable format. enable question reordering. 
        - for scrollable format, when adding new question, automatically minimise previous question to save space. 

- have an ai chat bar which helps recommend questions to make. 

- public/private

- gamemode bar with: standard, quiplash, fibbage, rate favourite drawings, custom (all!)

- local storage saves draft of quiz incase quiz is closed? is there a method to keep drafts like this? --> research and figure out. 





Your Quizzes! 

- all quizzes displayed with title, description, and emoji. 

- when clicking, opens right-click menu or context menu (color-block styled) which allows to start quiz or edit quiz. 


Edit Quiz!

- same layout as creating quiz, but states are filled with data from db of the quiz. 






Find Quiz!

- can copy quiz and edit it. 

- when running quiz, they become host, owner of quiz is different. 


Database, Backend

- integrate workos user data with neon db (drizzle configs)

- figure out how to store videos in cloudflare or aws s3 bucket.

- make the styling responsive - for mobile as well. 



Hosting games!

- learn how to do code configuration. only one game has that code, etc, etc..

- host allowed to remove players. 

- host can see stats o



Game Modes!

- standard: mcq, text, image answer, true/false

- quiplash type of game.

- fibbage type of game.

- rate favourite drawings.

- ai/host rates whether your drawing is good



Scoring:

- fastest time for standard

- quiplash: number of votes.

- fibbage: number of votes + choosing right answer

- drawings: number of votes. 


Storing data:

- Saving quiz data 

- saving win percentage and stats 

- Saving leaderboard scores for hosts and users. users shown by their usertags