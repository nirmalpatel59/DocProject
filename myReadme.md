1) npm install
2) bower install
3) grunt build
4) move server.js file to src folder
5) src/data/docs/ --> this folder contains all the project md files.
   e.g. src/data/docs/myprojectname/resume.md
   for home page create src/data/docs/myprojectname/myprojectname.md
6) in data.js file do this 

	Project.addNonWords('a,an,is,are,for');

	Project.add('dms', 'Help for Document Management')
        .addCategory('functions', 'Functions')
        .addDoc('about', 'About', '', {"fileName": "dms"})
        .addDoc('markdown', 'Markdown', '')
        .addDoc('project', 'Project', 'functions', {"tags": "design,help"})
        .addDoc('category', 'Categories', 'functions', {"tags": "design"})
        .addDoc('document', 'Documents', 'functions', {"tags": "design"})
        .addDoc('search', 'Search', 'functions', {"tags": "search"});

