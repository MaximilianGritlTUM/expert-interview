let currentPageIndex = 0;
let pages = [];
let formData = {};

formData["Expert-Info"] = {}
formData["Scenarios"] = {}
formData["General-Questions"] = {}



if (localStorage.currentPageIndex) {
    currentPageIndex = parseInt(localStorage.currentPageIndex);
}

// Load XML file
fetch('/content.xml')
    .then(response => response.text())
    .then(xmlString => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlString, 'text/xml');
        pages = xml.querySelectorAll('page');
        pages.forEach((page, index) => {
            formData["Scenarios"][index] = {};
            formData["Scenarios"][index]['cpee'] = {};
            formData["Scenarios"][index]['signavio'] = {};
        });

        if (localStorage.formData) {
            formData = JSON.parse(localStorage.formData);
        }

        // Default to the first page
        loadPage(pages[currentPageIndex]);
    });

function saveFormData() {
    const jsonData = vkbeautify.json(JSON.stringify(formData));
    const blob = new Blob([jsonData], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'form_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function loadPage(page) {
    const iframes = page.querySelectorAll('iframe');
    const iframeContainers = document.querySelectorAll('.iframe-container');
    iframes.forEach((iframe, index) => {
        iframeContainers[index].innerHTML = '';
        iframeContainers[index].appendChild(createIframe(iframe.textContent));
    });

    const cpeeQuestions = page.querySelectorAll('cpee')[0].querySelectorAll('question');
    const signavioQuestions = page.querySelectorAll('signavio')[0].querySelectorAll('question');
    const form = document.getElementById('interview-form');
    const cpeeContainer = form.getElementsByClassName('cpee-container')[0];
    const signavioContainer = form.getElementsByClassName('signavio-container')[0];
    cpeeContainer.innerHTML = '';
    signavioContainer.innerHTML = '';
    const cpeeLabel = document.createElement('label');
    cpeeLabel.textContent = "CPEE:";
    cpeeLabel.classList.add('title')
    const signavioLabel = document.createElement('label');
    signavioLabel.textContent = "Signavio:";
    signavioLabel.classList.add('title')
    cpeeContainer.append(cpeeLabel);
    signavioContainer.append(signavioLabel);

    cpeeQuestions.forEach(question => {
        const div = document.createElement('div');
        const label = document.createElement('label');
        label.textContent = question.textContent;
        const input = document.createElement('textarea');
        input.name = question.textContent.toLowerCase().replace(/\s+/g, '-');
        input.required = true;
        input.value = formData["Scenarios"][currentPageIndex]['cpee'][input.name] || '';
        input.addEventListener('input', updateFormDataCpee);
        div.appendChild(label);
        div.appendChild(input);
        cpeeContainer.appendChild(div);
    });

    signavioQuestions.forEach(question => {
        const div = document.createElement('div');
        const label = document.createElement('label');
        label.textContent = question.textContent;
        const input = document.createElement('textarea');
        input.name = question.textContent.toLowerCase().replace(/\s+/g, '-');
        input.required = true;
        input.value = formData["Scenarios"][currentPageIndex]['signavio'][input.name] || '';
        input.addEventListener('input', updateFormDataSignavio);
        div.appendChild(label);
        div.appendChild(input);
        signavioContainer.appendChild(div);
    });

    const progress = (currentPageIndex / (pages.length - 1)) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    const pageNumber = currentPageIndex + 1;
    document.getElementById('page-counter').textContent = `${pageNumber}/${pages.length}`;

    document.getElementById('prev-page-btn').style.visibility = currentPageIndex === 0 ? 'hidden' : 'visible';
    document.getElementById('next-page-btn').style.visibility = currentPageIndex === pages.length - 1 ? 'hidden' : 'visible';
}

function createIframe(src) {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = 0;
    return iframe;
}

function updateFormDataCpee(event) {
    formData["Scenarios"][currentPageIndex]["cpee"][event.target.name] = event.target.value;
    localStorage.formData = JSON.stringify(formData);
}

function updateFormDataSignavio(event) {
    formData["Scenarios"][currentPageIndex]["signavio"][event.target.name] = event.target.value;
    localStorage.formData = JSON.stringify(formData);
}

function updateFormDataExpertInfo(event) {
    formData["Expert-Info"][event.name] = event.value;
    localStorage.formData = JSON.stringify(formData);
}

function updateFormDataGeneralQuestions(event) {
    formData["General-Questions"][event.name] = event.value;
    localStorage.formData = JSON.stringify(formData);
}

function loadFormDataGeneralQuestions(event) {
    event.value = formData["General-Questions"][event.name]
}

function loadFormDataExpertInfo(event) {
    event.value = formData["Expert-Info"][event.name]
}

function navigatePage(direction) {
    currentPageIndex += direction;
    if (currentPageIndex < 0) {
        currentPageIndex = 0;
    } else if (currentPageIndex >= pages.length) {
        currentPageIndex = pages.length - 1;
    }
    localStorage.currentPageIndex = currentPageIndex;
    loadPage(pages[currentPageIndex]);
}

const darkThemeBtn = document.getElementById('dark-theme-btn');
darkThemeBtn.addEventListener('click', toggleDarkTheme);

function toggleDarkTheme() {
    document.body.classList.toggle('dark-theme');
    darkThemeBtn.classList.toggle('dark-mode');
}

function switchToScenarios() {
    document.getElementsByClassName("expert-info")[0].classList.add('hidden');
    document.getElementsByClassName("scenarios-form")[0].classList.remove('hidden');
}

function switchToGeneralQuestions() {
    document.getElementsByClassName("scenarios-form")[0].classList.add('hidden');
    document.getElementsByClassName("general-questions")[0].classList.remove('hidden');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar-left');
    if (sidebar.hidden == true){
        sidebar.removeEventListener('transitionend', hideSidebar)
        sidebar.hidden = false;
        const reflow = sidebar.offsetHeight;
    }else{
        sidebar.addEventListener('transitionend', hideSidebar)
    }
    sidebar.classList.toggle('open');
}

function toggleSidebarRight() {
    const sidebar = document.getElementById('sidebar-right');
    if (sidebar.hidden == true){
        sidebar.removeEventListener('transitionend', hideSidebar)
        sidebar.hidden = false;
        const reflow = sidebar.offsetHeight;
    }else{
        sidebar.addEventListener('transitionend', hideSidebar)
    }
    sidebar.classList.toggle('open');
}

function hideSidebar(evt) {
    evt.currentTarget.hidden = true;
}

document.getElementById('open-sidebar-btn-left').addEventListener('click', () => {
    toggleSidebarRight();
});

document.getElementById('open-sidebar-btn-right').addEventListener('click', () => {
    toggleSidebar();
});

document.getElementById('close-sidebar-btn-left').addEventListener('click', toggleSidebar);

document.getElementById('close-sidebar-btn-right').addEventListener('click', toggleSidebarRight);
