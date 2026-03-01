// close mobile nav on link click
document.querySelectorAll('.navbar-nav .nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
        var navbarCollapse = document.getElementById('navbarCollapse');

        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            var bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);

            if (bsCollapse) {
                bsCollapse.hide();
            }
        }
    });
});

// pwa
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/assets/js/service-worker.js');
    });
}

// marketplace
(function () {
    var skillsData = null;
    var searchInput = document.getElementById('skills-search');
    var skillsGrid = document.getElementById('skills-grid');
    var skillsLoading = document.getElementById('skills-loading');
    var skillsEmpty = document.getElementById('skills-empty');
    var skillsError = document.getElementById('skills-error');
    var debounceTimer = null;

    function fetchSkills() {
        fetch('/skills/index.json')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to fetch skills');
                }

                return response.json();
            })
            .then(function (data) {
                skillsData = data.skills || [];
                skillsLoading.style.display = 'none';
                renderSkills(skillsData, false);
            })
            .catch(function () {
                skillsLoading.style.display = 'none';
                skillsError.style.display = 'block';
            });
    }

    function renderSkills(skills, isSearch) {
        if (skills.length === 0) {
            skillsGrid.style.display = 'none';
            skillsEmpty.style.display = isSearch ? 'block' : 'none';
            return;
        }

        skillsEmpty.style.display = 'none';
        skillsGrid.style.display = 'flex';

        // show random 9 when no search query
        var displaySkills = skills;

        if (!isSearch && skills.length > 9) {
            displaySkills = shuffle(skills.slice()).slice(0, 9);
        }

        var html = '';

        for (var i = 0; i < displaySkills.length; i++) {
            html += createSkillCard(displaySkills[i]);
        }

        skillsGrid.innerHTML = html;
    }

    function shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }

        return array;
    }

    function createSkillCard(skill) {
        var licenseHtml = '';

        if (skill.license) {
            licenseHtml = '<button type="button" class="btn btn-outline-light" onclick="openSkillModal(\'' + escapeHtml(skill.license) + '\', \'' + escapeHtml(skill.name) + ' — License\')">' +
                '<i class="bi bi-file-text me-1"></i>License' +
                '</button>';
        }

        var readmeHtml = '';

        if (skill['readme-url']) {
            readmeHtml = '<button type="button" class="btn btn-outline-light" onclick="openSkillModal(\'' + escapeHtml(skill['readme-url']) + '\', \'' + escapeHtml(skill.name) + '\')">' +
                '<i class="bi bi-book me-1"></i>Read' +
                '</button>';
        }

        return '<div class="col-md-6 col-lg-4">' +
            '<div class="skill-card">' +
                '<div class="skill-card-header">' +
                    '<div class="icon-box"><i class="bi bi-lightning"></i></div>' +
                    '<h3>' + escapeHtml(skill.name) + '</h3>' +
                '</div>' +
                '<span class="skill-card-source">' + escapeHtml(skill.source) + '</span>' +
                '<p class="skill-card-description">' + escapeHtml(skill.description) + '</p>' +
                '<div class="skill-card-actions">' +
                    '<a href="' + escapeHtml(skill['download-url']) + '" class="btn btn-primary">' +
                        '<i class="bi bi-download me-1"></i>Download' +
                    '</a>' +
                    readmeHtml +
                    licenseHtml +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function filterSkills(query) {
        if (!skillsData) {
            return;
        }

        var terms = query.toLowerCase().trim();

        if (terms === '') {
            renderSkills(skillsData, false);
            return;
        }

        var nameMatches = [];
        var otherMatches = [];

        for (var i = 0; i < skillsData.length; i++) {
            var skill = skillsData[i];
            var name = (skill.name || '').toLowerCase();
            var description = (skill.description || '').toLowerCase();
            var source = (skill.source || '').toLowerCase();

            if (name.indexOf(terms) !== -1) {
                nameMatches.push(skill);
            } else if (description.indexOf(terms) !== -1 || source.indexOf(terms) !== -1) {
                otherMatches.push(skill);
            }
        }

        renderSkills(nameMatches.concat(otherMatches), true);
    }

    function escapeHtml(text) {
        if (!text) {
            return '';
        }

        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);

            debounceTimer = setTimeout(function () {
                filterSkills(searchInput.value);
            }, 200);
        });
    }

    fetchSkills();
})();

// skill modal
function stripFrontmatter(text) {
    if (!text.startsWith('---')) {
        return text;
    }

    var end = text.indexOf('---', 3);

    if (end === -1) {
        return text;
    }

    return text.substring(end + 3).trim();
}

function openSkillModal(url, name) {
    var modalEl = document.getElementById('skill-modal');
    var modalTitle = document.getElementById('skill-modal-title');
    var modalBody = document.getElementById('skill-modal-body');

    modalTitle.textContent = name;
    modalBody.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

    var modal = new bootstrap.Modal(modalEl);
    modal.show();

    fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Failed to fetch');
            }

            return response.text();
        })
        .then(function (text) {
            var content = stripFrontmatter(text);
            modalBody.innerHTML = '<div class="skill-modal-markdown">' + marked.parse(content) + '</div>';
        })
        .catch(function () {
            modalBody.innerHTML = '<div class="text-center py-4"><p class="text-muted">Failed to load content.</p></div>';
        });
}
