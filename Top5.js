const API_BASE_URL = window.location.hostname === ""
        ? "https://localhost:7073" : "https://athleticsresultsapi-drardae4htehawen.ukwest-01.azurewebsites.net"; 

const params = new URLSearchParams(window.location.search);
const Main = params.get('League');
const API_ENDPOINTS = {
    main: `${API_BASE_URL}/top5byleague`,
    qk: `${API_BASE_URL}/top5byleagueQK`,
    list: `${API_BASE_URL}/listappfolder`
};

var PollingTime = 1; // in minutes
var num = 0;
var numUpdating = "";
var pageLoadTimeoutId = null; 
var TeamsFilterMain = "";
var TeamsFilterQK = "";
var mainlastcachecreated = "";
var qklastcachecreated = "";

setInterval(function () { 
    if (numUpdating == "Updating") {
        num--;
        document.getElementById('IntervalCounter')
            .innerHTML = "Updating.....";
    }
    else {
        num--;
        let mins = Math.floor(num / 60);
        let secs = num % 60;
        let twoDigit = secs < 10 ? '0' + secs : secs.toString();
        document.getElementById('IntervalCounter')
            .innerHTML = "Updating in " + mins + ":" + twoDigit;
    }
}
    , 1000);
function CheckboxController(clicked) {
    let container = document.getElementById(clicked.closest(".tab-pane").id);
    if (!container) return;

    let checkboxes = container.querySelectorAll('input[type="checkbox"]');
    let hideBox = container.querySelector('input[name="Hide"]');
    let allBox = container.querySelector('input[name="All"]');

    let normalBoxes = Array.from(checkboxes)
        .filter(cb => cb !== hideBox && cb !== allBox);

    if (clicked === hideBox) {
        checkboxes.forEach(cb => cb.checked = false);
        hideBox.checked = true;
        return;
    }

    if (clicked === allBox) {
        // normalBoxes.forEach(cb => cb.checked = true);
        // allBox.checked = true;
        checkboxes.forEach(cb => cb.checked = true);
        hideBox.checked = false;
        return;
    }
}

function SelectAllToggle(divId) {
    let container = document.getElementById(divId);
    if (!container) return;
    let checkboxes = container.querySelectorAll('input[type="checkbox"]');
    let hideBox = container.querySelector('input[name="Hide"]');
    let allBox = container.querySelector('input[name="All"]');
    let normalBoxes = Array.from(checkboxes).filter(cb => cb !== hideBox && cb !== allBox); 

    if (normalBoxes.every(cb => cb.checked)) {
        allBox.checked = true;
        hideBox.checked = false;
        return;
    }

    allBox.checked = false;
    if (normalBoxes.every(cb => !cb.checked)) {
        hideBox.checked = true;
    }
    else {
        hideBox.checked = false;
    }
}
function filterConditionAgeSex(divId) {
    let container = document.getElementById(divId);
    if (!container) return { filterConditionAge: () => true, filterConditionSex: () => true };

    let allowedCategoriesAge = [];
    if (container.querySelector('#U9')?.checked) allowedCategoriesAge.push("U9");
    if (container.querySelector('#U10')?.checked) allowedCategoriesAge.push("U10");
    if (container.querySelector('#U11')?.checked) allowedCategoriesAge.push("U11");
    if (container.querySelector('#U12')?.checked) allowedCategoriesAge.push("U12");
    if (container.querySelector('#U13')?.checked) allowedCategoriesAge.push("U13");
    if (container.querySelector('#U14')?.checked) allowedCategoriesAge.push("U14");
    if (container.querySelector('#U15')?.checked) allowedCategoriesAge.push("U15");
    if (container.querySelector('#U16')?.checked) allowedCategoriesAge.push("U16");
    if (container.querySelector('#U17')?.checked) allowedCategoriesAge.push("U17");
    if (container.querySelector('#U18')?.checked) allowedCategoriesAge.push("U18");
    if (container.querySelector('#U19')?.checked) allowedCategoriesAge.push("U19");
    if (container.querySelector('#U20')?.checked) allowedCategoriesAge.push("U20");

    let allowedCategoriesSex = [];
    if (container.querySelector('#Female')?.checked) allowedCategoriesSex.push("F");
    if (container.querySelector('#Male')?.checked) allowedCategoriesSex.push("M");

    return {
        filterConditionAge: x => allowedCategoriesAge.includes(x[0]),
        filterConditionSex: x => allowedCategoriesSex.includes(x[1])
    };
}
function filterConditionEvent(divId) {
    let container = document.getElementById(divId);
    if (!container) return () => true; 

    const track = container.querySelector('#Track');
    const field = container.querySelector('#Field');
   
    return function (x) {                   // Return a filter function that uses the current checkbox states
        if (track?.checked && field?.checked) {
            return true;                    // Both Track and Field selected
        } else if (track?.checked && !field?.checked) {
            return !isNaN(x[2].charAt(0));  // Only Track selected
        } else if (!track?.checked && field?.checked) {
            return isNaN(x[2].charAt(0));   // Only Field selected
        } else {
            return false;                   // Neither Track nor Field selected
        }
    };
}
function tableGenerator(JSONArr, TableOpt) {
    let table = '';

    table += '<table class="table"><tbody>';

    for (let i = 0; i < JSONArr.length; i++) {

        if (i > 0 && (JSONArr[i][0] != JSONArr[i - 1][0] || JSONArr[i][1] != JSONArr[i - 1][1])) {  // Create a new table if the age or sex changes
                table += `</tbody></table><table class="table"><tbody>`;
        }

        if (JSONArr[i][3] == "" && (i + 1 >= JSONArr.length || JSONArr[i + 1][5] == "")) {   // Hide events titles with no recorded athletes
        }
        else if (JSONArr[i][3] == "" & JSONArr[i][1] == "M") {  // Highlight event titles - Boys
            table += '<tr style="background-color: aliceblue;"><td style="background-color: aliceblue;" colspan="5">'
            table += JSONArr[i][4]
            table += '</td>'
            table += '<td style="background-color: aliceblue; text-align:right" colspan="3"; >'
            table += JSONArr[i][8]
            table += ' '
            table += JSONArr[i][9]
            table += '</td></tr>';
        }
        else if (JSONArr[i][3] == "") {                         // Highlight event titles - Girls
            table += '<tr style="background-color: lavenderblush;"><td style="background-color: lavenderblush;" colspan="5">'
            table += JSONArr[i][4]
            table += '</td>'
            table += '<td style="background-color: lavenderblush; text-align:right" colspan="3"; >'
            table += JSONArr[i][8]
            table += ' '
            table += JSONArr[i][9]
            table += '</td></tr>';
        }
        else if (JSONArr[i][5] == "") {                         // Hide rows without athletes
        }
        else {
            if (TableOpt == "Main") {                           // Display athletes
                table += `
                <tr>
                    <td style="width:6%">${JSONArr[i][4]}</td>
                    <td style="width:6%">${JSONArr[i][5].toUpperCase()}</td>
                    <td style="width:6%">${JSONArr[i][6]}</td>`;
                table += WindSpeed(JSONArr[i][10]);
                table += `
                    <td style="width:40%">${JSONArr[i][7]}</td>
                    <td style="width:5%;"></td><!-- <img onclick="Pof10(this,'Main')" src="Pof10a.jpg" width="26px"></td> -->
                    <td style="width:25%">${JSONArr[i][8]}</td>
                    <td style="width:6%; text-align: center">${JSONArr[i][9]}</td>
                </tr>
                `;
            }
            else if (TableOpt == "QK") {
                table += `
                <tr>
                    <td style="width:12%">${JSONArr[i][4]}</td>
                    <td style="width:12%">${JSONArr[i][6]}</td>
                    <td style="width:43%">${JSONArr[i][7]}</td>
                    <td style="width:5%;"></td><!-- <img onclick="Pof10(this,'QK')" src="Pof10a.jpg" width="26px"></td> -->
                    <td style="width:20%">${JSONArr[i][8]}</td>
                    <td style="width:8%">${JSONArr[i][9]}</td>
                </tr>
                `;
            }
        }
    }

    table += '</tbody></table>';

    if (TableOpt == "Main") {
        document.getElementById('tableResultsMain').innerHTML = table;
    }
    else if (TableOpt == "QK") {
        document.getElementById('tableResultsQK').innerHTML = table;
    }
}
function WindSpeed(n) {
    if (n == "") {
        return `<td style="width:6%"></td>`;
    }
    const colour = n == 0 ? 'black'
        : ((n > 2 || n < -2) ? 'red' : 'green');
    const signed = n == 0 ? "0.0"
        : (n > 0 ? `+${n}` : `-${Math.abs(n)}`);
    return `<td style="width:6%; text-align: center; color:${colour}">${signed}</td>`;
}


async function getJSONData() {
    if (numUpdating == "Updating") { return; }
    numUpdating = "Updating";
    try {
        num = PollingTime * 60; // declared in seconds
        getFiles();

        const [
          mainRes,
            qkRes
        ] = await Promise.all([
            fetch(`${API_ENDPOINTS.main}?cacheCreated=${mainlastcachecreated}&league=${Main}`).catch(e => e),
            fetch(`${API_ENDPOINTS.qk}?cacheCreated=${qklastcachecreated}&league=${Main}`).catch(e => e)
        ]);

        
   
        // Main
        if (mainRes && mainRes.ok) {
            const data = await mainRes.json();

            // If no changes, exit
            if (data.result !== "No changes") {

            // Results
            JSONArrdataMain = data.text;
            const distinctCol0 = [...new Set(JSONArrdataMain.filter(row => row[3] && row[3].trim() !== "")   
                        .map(row => row[0]).filter(v => v && v.trim() !== ""))];
            const navbar1 = document.getElementById('age-group1');
            if (navbar1) {
                navbar1.querySelectorAll('.form-check.form-check-inline').forEach(div => {
                    div.style.display = 'none';
                });

                distinctCol0.forEach(val => {
                    const input = navbar1.querySelector(`input[type="checkbox"]#${CSS.escape(val)}`);
                    if (input) {
                        const wrapper = input.closest('.form-check');
                        if (wrapper) {
                            wrapper.style.display = 'inline-block';
                        }
                    }
                });
            }
            renderTeamsFilter(JSONArrdataMain, 'TeamsFilterMain', applyTeamsFilter.bind(null, '#tableResultsMain', 'TeamsFilterMain', 6));
            const { filterConditionAge: AgeTab1, filterConditionSex: SexTab1 } = filterConditionAgeSex('Tab1');
            const EventTab1 = filterConditionEvent('Tab1');
            tableGenerator(JSONArrdataMain.filter(AgeTab1).filter(SexTab1).filter(EventTab1), "Main");
            applyTeamsFilter('#tableResultsMain', 'TeamsFilterMain', 6);

            

           

            // Update last cache created
            mainlastcachecreated = data.CachedCreated;
            }
        } else {
            console.error("Error fetching JSON: main", mainRes);
        }
           
        // QK
        if (qkRes && qkRes.ok) {
            const data = await qkRes.json();

            // If no changes, exit
            if (data.result !== "No changes") {

            JSONArrdataQK = data.text;
            const distinctCol0QK = [...new Set(JSONArrdataQK.filter(row => row[3] && row[3].trim() !== "")
                .map(row => row[0]).filter(v => v && v.trim() !== ""))];
            const navbar3 = document.getElementById('age-group3');
            if (navbar3) {
                navbar3.querySelectorAll('.form-check.form-check-inline').forEach(div => {
                    div.style.display = 'none';
                });
                distinctCol0QK.forEach(val => {
                    const input = navbar3.querySelector(`input[type="checkbox"]#${CSS.escape(val)}`);
                    if (input) {
                        const wrapper = input.closest('.form-check');
                        if (wrapper) {
                            wrapper.style.display = 'inline-block';
                        }
                    }
                });
            }
            renderTeamsFilter(
                JSONArrdataQK,
                'TeamsFilterQK',
                applyTeamsFilter.bind(null, '#tableResultsQK', 'TeamsFilterQK', 4)
            );

            const { filterConditionAge: AgeTab3, filterConditionSex: SexTab3 } = filterConditionAgeSex('Tab3');
            const EventTab3 = filterConditionEvent('Tab3');
            tableGenerator(JSONArrdataQK.filter(AgeTab3).filter(SexTab3).filter(EventTab3), "QK");
            applyTeamsFilter('#tableResultsQK', 'TeamsFilterQK', 4);

           
            // Update last cache created
            qklastcachecreated = data.CachedCreated;
            }

        } else {
            console.error("Error fetching JSON: qk", qkRes);
        }

       

    } finally {
        // Always clear and reschedule
        numUpdating = "";
        if (pageLoadTimeoutId) {
            clearTimeout(pageLoadTimeoutId);
        }
        pageLoadTimeoutId = setTimeout(getJSONData, num * 1000);
    }
}
function Refresh(divId) {
    let container = divId.closest(".tab-pane").id;
    if (!container) return;

    SelectAllToggle(container);

    if (container === 'Tab1') {
        const { filterConditionAge: AgeTab1, filterConditionSex: SexTab1 } = filterConditionAgeSex('Tab1');
        const EventTab1 = filterConditionEvent('Tab1');
        tableGenerator(JSONArrdataMain.filter(AgeTab1).filter(SexTab1).filter(EventTab1), "Main");
        applyTeamsFilter('#tableResultsMain', 'TeamsFilterMain', 6);
    }
    else if (container === 'Tab3') {
        const { filterConditionAge: AgeTab3, filterConditionSex: SexTab3 } = filterConditionAgeSex('Tab3');
        const EventTab3 = filterConditionEvent('Tab3');
        tableGenerator(JSONArrdataQK.filter(AgeTab3).filter(SexTab3).filter(EventTab3), "QK");
        applyTeamsFilter('#tableResultsQK', 'TeamsFilterQK', 4);
    }
  
}

window.onscroll = function () {   // Scroll back to top button functionality
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("btn-back-to-top").style.display = "block";
    }
    else {
        document.getElementById("btn-back-to-top").style.display = "none";
    }
};
document.getElementById("btn-back-to-top").addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

function renderTeamsFilter(JSONArr, ID, updateCallback) {
    const container = document.getElementById(ID);
    if (!container) return;
    const values = [
        ...new Set(
            JSONArr
                .filter(row => row[7] && row[7].trim() !== "")
                .map(row => row[8] && row[8].normalize().trim())
                .filter(v => v)
        )
    ].sort();

    if (window[ID] != values.length) {
        const previous = {};
        container.querySelectorAll(`.${ID}`).forEach(cb => {
            previous[cb.value] = cb.checked;
        });
        window[ID] = values.length;
        let html = '<div class="form-check form-check-inline" style="margin-right:6px;"><label>Teams:</label></div>';
        values.forEach(val => {
            const isChecked = previous.hasOwnProperty(val) ? previous[val] : true;  // Restore previous state if exists, otherwise default to checked
            html += `<div class="form-check form-check-inline">
                <input class="form-check-input ${ID}" type="checkbox" value="${val}" id="${ID}-${val}" name="${ID}-${val}" ${isChecked ? "checked" : ""}>
                <label class="form-check-label" for="${ID}-${val}">${val}</label>
            </div>`;
        });
        container.innerHTML = html;
        container.querySelectorAll(`.${ID}`).forEach(cb => {
            cb.addEventListener('change', updateCallback);
        });
    }
}
function applyTeamsFilter(tableSelector, checkboxSelector, teamColIndex) {
    const checked = Array.from(document.querySelectorAll(`.${checkboxSelector}` + ':checked')).map(cb => cb.value);
    document.querySelectorAll(tableSelector + ' table tr').forEach(tr => {
        const tds = tr.querySelectorAll('td');
        if (tds.length > teamColIndex) {
            const val = tds[teamColIndex].textContent.trim();
            tr.style.display = checked.includes(val) ? '' : 'none';
        }
    });
}




async function getFiles() {
    try {
        const response = await fetch(API_ENDPOINTS.list);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        const data = await response.json();
            const name = findNameById(data, Main);
            const el = document.getElementById("Title_Text");  //To Do - this isn't working properly - Top 5 Results always shows
            el.classList.remove("show");     
        if (!name) {el.textContent = "Top 5 Results";}
        else {el.textContent = formatFilename(name);}
                requestAnimationFrame(() => {
                    el.classList.add("show");      // trigger fade-in
                });
         }
         catch (error) {
            console.error("Error fetching JSON:", error);
         }
    }
    function findNameById(node, targetId) {
        if (node.id === targetId) {
            return node.name;
        }
        if (Array.isArray(node.children)) {
            for (const child of node.children) {
                const result = findNameById(child, targetId);
                if (result) return result;
            }
         }
         return null;
}
    function formatFilename(filename) {
        const dateMatch = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (!dateMatch) return null;

        const [_, year, month, day] = dateMatch;

        // Convert to readable date
        const date = new Date(`${year}-${month}-${day}`);
        const formattedDate = date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        // Extract prefix before first underscore
        const prefix = filename.split("_")[0];

        return `${prefix} - ${formattedDate}`;
    }


