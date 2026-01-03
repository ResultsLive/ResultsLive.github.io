const API_BASE_URL = window.location.hostname === ""
        ? "https://localhost:7073" : "https://athleticsresultsapi-drardae4htehawen.ukwest-01.azurewebsites.net"; 

const params = new URLSearchParams(window.location.search);
const Main = params.get('Main');
const QK = params.get('QK');
const API_ENDPOINTS = {
    main: `${API_BASE_URL}/JSONMain/${Main}`,
    ns:     `${API_BASE_URL}/JSONNS`,
    qk: `${API_BASE_URL}/JSONQK/${QK}`,
    scores: `${API_BASE_URL}/JSONScores`,
    declarations: `${API_BASE_URL}/JSONDeclarations`,
    list: `${API_BASE_URL}/listappfolder`
};

var PollingTime = 1; // in minutes
var num = 0;
var numUpdating = "";
var pageLoadTimeoutId = null; 
var TeamsFilterMain = "";
var TeamsFilterNS = "";
var TeamsFilterQK = "";
var TeamsFilterDeclarations = "";

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
function SelectAll(divId) {
    let container = document.getElementById(divId);
    if (!container) return;
    let checkboxes = container.querySelectorAll('input[type="checkbox"]');
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = true;
    }
}
function SelectAllToggle(divId) {
    let container = document.getElementById(divId);
    if (!container) return;
    let checkboxes = container.querySelectorAll('input[type="checkbox"]:not(#All)');  
    if (Array.from(checkboxes).every(checkbox => checkbox.checked)) {
        container.querySelector('#All').checked = true;
    }
    else {
        container.querySelector('#All').checked = false;
    }
}
function filterConditionAgeSex(divId) {
    let container = document.getElementById(divId);
    if (!container) return { filterConditionAge: () => true, filterConditionSex: () => true };

    let allowedCategoriesAge = [];
    if (container.querySelector('#U9')?.checked) allowedCategoriesAge.push("U9");
    if (container.querySelector('#U11')?.checked) allowedCategoriesAge.push("U11");
    if (container.querySelector('#U14')?.checked) allowedCategoriesAge.push("U14");
    if (container.querySelector('#U15')?.checked) allowedCategoriesAge.push("U15");
    if (container.querySelector('#U17')?.checked) allowedCategoriesAge.push("U17");
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
            table += '<tr style="background-color: aliceblue;"><td style="background-color: aliceblue;" colspan="4">'
            table += JSONArr[i][4]
            table += '</td>'
            table += '<td style="background-color: aliceblue; text-align:right" colspan="4"; >'
            table += JSONArr[i][8]
            table += ' '
            table += JSONArr[i][9]
            table += '</td></tr>';
        }
        else if (JSONArr[i][3] == "") {                         // Highlight event titles - Girls
            table += '<tr style="background-color: lavenderblush;"><td style="background-color: lavenderblush;" colspan="4">'
            table += JSONArr[i][4]
            table += '</td>'
            table += '<td style="background-color: lavenderblush; text-align:right" colspan="4"; >'
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
                    <td style="width:5%;"><img onclick="Pof10(this,'Main')" src="Pof10a.jpg" width="26px"></td>
                    <td style="width:25%">${JSONArr[i][8]}</td>
                    <td style="width:6%; text-align: center">${JSONArr[i][9]}</td>
                </tr>
                `;
            }
            else if (TableOpt == "NS") {
                table += `
                <tr>
                    <td style="width:12%">${JSONArr[i][5]}</td>
                    <td style="width:12%">${JSONArr[i][6]}</td>
                    <td style="width:43%">${JSONArr[i][7]}</td>
                    <td style="width:5%;"><img onclick="Pof10(this,'NS')" src="Pof10a.jpg" width="26px"></td>
                    <td style="width:20%">${JSONArr[i][8]}</td>
                    <td style="width:8%"></td><!-- ToDO: select PB awards level for NS -->
                </tr>
                `;
            }
            else if (TableOpt == "QK") {
                table += `
                <tr>
                    <td style="width:12%">${JSONArr[i][5]}</td>
                    <td style="width:12%">${JSONArr[i][6]}</td>
                    <td style="width:43%">${JSONArr[i][7]}</td>
                    <td style="width:5%;"><img onclick="Pof10(this,'QK')" src="Pof10a.jpg" width="26px"></td>
                    <td style="width:20%">${JSONArr[i][8]}</td>
                    <td style="width:8%">${JSONArr[i][9]}</td>
                </tr>
                `;
            }
            else if (TableOpt == "QKPoints") {
                table += `
                <tr>
                    <td style="width:6%">${JSONArr[i][2]}</td>
                    <td style="width:18%">${JSONArr[i][9]} (${JSONArr[i][5]}+${JSONArr[i][6]}+${JSONArr[i][7]}+${JSONArr[i][8]})</td>
                    <td style="width:43%">${JSONArr[i][3]}</td>
                    <td style="width:5%;"><img onclick="Pof10(this,'QK')" src="Pof10a.jpg" width="26px"></td>
                    <td style="width:20%">${JSONArr[i][4]}</td>
                    <td style="width:8%"></td>
                </tr>
                `;
            }
        }
    }

    table += '</tbody></table>';

    if (TableOpt == "Main") {
        document.getElementById('tableResultsMain').innerHTML = table;
    }
    else if (TableOpt == "NS") {
        document.getElementById('tableResultsNS').innerHTML = table;
    }
    else if (TableOpt == "QK") {
        document.getElementById('tableResultsQK').innerHTML = table;
    }
    else if (TableOpt == "QKPoints") {
        document.getElementById('tableResultsQKPoints').innerHTML = table;
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
function tableGeneratorDeclarations(JSONArr, TableOpt) {

    let table = '';

    table += '<table class="table"><tbody>';

    for (let i = 0; i < JSONArr.length; i++) {

        if (i > 0 && (JSONArr[i][0] != JSONArr[i - 1][0] || JSONArr[i][1] != JSONArr[i - 1][1])) {  // Create a new table if the age or sex changes
            table += `</tbody></table><table class="table"><tbody>`;
        }

        if (JSONArr[i][3] == "String" && (i + 1 >= JSONArr.length || JSONArr[i + 1][3] == "String")) {   // Hide events titles with no recorded athletes
        }
        else if (JSONArr[i][3] == "String" & JSONArr[i][1] == "M") {  // Highlight event titles - Boys
            table += `
                <tr style="background-color: aliceblue;"><td style="background-color: aliceblue;" colspan="6">
                ${JSONArr[i][8]} ${JSONArr[i][7]}
                </td></tr>
                `;
        }
        else if (JSONArr[i][3] == "String") {                         // Highlight event titles - Girls
            table += `
                <tr style="background-color: lavenderblush;"><td style="background-color: lavenderblush;" colspan="6">
                ${JSONArr[i][8]} ${JSONArr[i][7]}
                </td></tr>
                `;
        }
        else if (JSONArr[i][4] != "") {                         // Hide rows without athletes
        }
        else {
            if (TableOpt == "Declarations") {                           // Display athletes
                table += `
                <tr>
                    <td style="width:12%">${JSONArr[i][3]}</td>
                    <td style="width:12%">${JSONArr[i][5]}</td>
                    <td style="width:43%">${JSONArr[i][7]}</td>
                    <td style="width:5%;"><img onclick="Pof10(this,'Declarations')" src="Pof10a.jpg" width="26px"></td>
                    <td style="width:20%">${JSONArr[i][8]}</td> 
                    <td style="width:8%">${JSONArr[i][9]}</td>
                </tr>
                `;
            }
           
        }
    }

    table += '</tbody></table>';

    if (TableOpt == "Declarations") {
        document.getElementById('tableResultsDeclarations').innerHTML = table;
    }
  

}
function tableGeneratorScores(JSONArr) {
    let table = '';

    table += '<table class="table" style="width:80%; margin-left:auto; margin-right:auto;"><tbody>';

    for (let i = 0; i < JSONArr.length; i++) {

        if ([i] == 0) {                                                  
          //  table += `<tr><td colspan="3" style="text-align:center">${JSONArr[i][0]}</td></tr>`;
        }
        else if ([i] == 1) { }
        else if ([i] == 2) {                                                  
           // table += `<tr><td colspan="3" style="text-align:center">${JSONArr[i][1]} - ${JSONArr[i][2]}</td></tr>`;
        }
        else if ([i] == 3) { }
        else if ([i] == 13 || [i] == 23 || [i] == 33 || [i] == 43 || [i] == 53 || [i] == 63) {              
            table += `</tbody></table><table class="table" style="width:80%; margin-left:auto; margin-right:auto;"><tbody>
                `;
        }
        else if ([i] == 4 || [i] == 14 || [i] == 24) {                                     
            table += `
                <tr style="background-color: aliceblue;">
                    <td style="background-color: aliceblue;">${JSONArr[i][1]}</td>
                    <td style="background-color: aliceblue;">${JSONArr[i][0]}</td>
                    <td style="background-color: aliceblue;">${JSONArr[i][2]}</td>  
                </tr>
                `;
        }
        else if ([i] == 34 || [i] == 44 || [i] == 54 ) {                               
            table += `
                <tr style="background-color: lavenderblush;">
                    <td style="background-color: lavenderblush;">${JSONArr[i][1]}</td>
                    <td style="background-color: lavenderblush;">${JSONArr[i][0]}</td>
                    <td style="background-color: lavenderblush;">${JSONArr[i][2]}</td>  
                </tr>
                `;
        }
        else if ([i] == 64 ) {                                
            table += `
                <tr style="background-color: lemonchiffon;">
                    <td style="background-color: lemonchiffon;">${JSONArr[i][1]}</td>
                    <td style="background-color: lemonchiffon;">${JSONArr[i][0]}</td>
                    <td style="background-color: lemonchiffon;">${JSONArr[i][2]}</td>  
                </tr>
                `;
        }
        else if (JSONArr[i][0] == "0" || JSONArr[i][0] == "") {                     
        }
        else {                                                  // Display recorded athletes
            table += `
                <tr>
                     <td>${JSONArr[i][1]}</td>
                     <td>${JSONArr[i][0]}</td>
                     <td>${JSONArr[i][2]}</td>    
                </tr>
                `;
        }
    }

    table += '</tbody></table><div>&nbsp </div><div>&nbsp </div>';

    document.getElementById('tableScores').innerHTML = table;
}

async function getJSONData() {
    if (numUpdating == "Updating") { return; }
    numUpdating = "Updating";
    try {
        num = PollingTime * 60; // declared in seconds
        getFiles();

        const [
            mainRes,
            nsRes,
            qkRes,
            scoresRes,
            declarationsRes
        ] = await Promise.all([
            fetch(API_ENDPOINTS.main).catch(e => e),
            fetch(API_ENDPOINTS.ns).catch(e => e),
            fetch(API_ENDPOINTS.qk).catch(e => e),
            fetch(API_ENDPOINTS.scores).catch(e => e),
            fetch(API_ENDPOINTS.declarations).catch(e => e)
        ]);

        // Main
        if (mainRes && mainRes.ok) {
            const data = await mainRes.json();
            JSONArrdataMain = data.text;
            renderTeamsFilter(
                JSONArrdataMain,
                'TeamsFilterMain',
                applyTeamsFilter.bind(null, '#tableResultsMain', 'TeamsFilterMain', 6)
            );

            const { filterConditionAge: AgeTab1, filterConditionSex: SexTab1 } = filterConditionAgeSex('Tab1');
            const EventTab1 = filterConditionEvent('Tab1');
            tableGenerator(JSONArrdataMain.filter(AgeTab1).filter(SexTab1).filter(EventTab1), "Main");
            applyTeamsFilter('#tableResultsMain', 'TeamsFilterMain', 6);

            const el = document.getElementById("MessageID");
            el.classList.remove("show");
            el.textContent = data.message;
            requestAnimationFrame(() => { el.classList.add("show"); });
        } else {
            console.error("Error fetching JSON: main", mainRes);
        }

        // NS
        if (nsRes && nsRes.ok) {
            const data = await nsRes.json();
            JSONArrdataNS = data.text;
            renderTeamsFilter(
                JSONArrdataNS,
                'TeamsFilterNS',
                applyTeamsFilter.bind(null, '#tableResultsns', 'TeamsFilterNS', 4)
            );

            const { filterConditionAge: AgeTab2, filterConditionSex: SexTab2 } = filterConditionAgeSex('Tab2');
            const EventTab2 = filterConditionEvent('Tab2');
            tableGenerator(JSONArrdataNS.filter(AgeTab2).filter(SexTab2).filter(EventTab2), "NS");
            applyTeamsFilter('#tableResultsNS', 'TeamsFilterNS', 4);
        } else {
            console.error("Error fetching JSON: ns", nsRes);
        }

        // QK
        if (qkRes && qkRes.ok) {
            const data = await qkRes.json();
            JSONArrdataQK = data.text;
            renderTeamsFilter(
                JSONArrdataQK,
                'TeamsFilterQK',
                applyTeamsFilter.bind(null, '#tableResultsQK', 'TeamsFilterQK', 4)
            );

            const { filterConditionAge: AgeTab3, filterConditionSex: SexTab3 } = filterConditionAgeSex('Tab3');
            const EventTab3 = filterConditionEvent('Tab3');
            tableGenerator(JSONArrdataQK.filter(AgeTab3).filter(SexTab3).filter(EventTab3), "QK");
            applyTeamsFilter('#tableResultsQK', 'TeamsFilterQK', 4);

            JSONArrdataQKPoints = data.points;
            tableGenerator(JSONArrdataQKPoints, "QKPoints");
        } else {
            console.error("Error fetching JSON: qk", qkRes);
        }

        // Scores
        if (scoresRes && scoresRes.ok) {
            const data = await scoresRes.json();
            JSONArrdataScores = data.text;
            tableGeneratorScores(JSONArrdataScores);
        } else {
            console.error("Error fetching JSON: scores", scoresRes);
        }

        // Declarations
        if (declarationsRes && declarationsRes.ok) {
            const data = await declarationsRes.json();
            JSONArrdataDeclarations = data.text;
            renderDeclarationFilterMenu(JSONArrdataDeclarations);

            const { filterConditionAge: AgeTab5, filterConditionSex: SexTab5 } = filterConditionAgeSex('Tab5');
            const EventTab5 = filterConditionEvent('Tab5');
            tableGeneratorDeclarations(JSONArrdataDeclarations.filter(AgeTab5).filter(SexTab5).filter(EventTab5), "Declarations");
            applyTeamsFilter('#tableResultsDeclarations', 'declarations-filter', 4);
        } else {
            console.error("Error fetching JSON: declarations", declarationsRes);
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
    let container = document.getElementById(divId);
    if (!container) return;

    SelectAllToggle(divId);

    if (divId === 'Tab1') {
        const { filterConditionAge: AgeTab1, filterConditionSex: SexTab1 } = filterConditionAgeSex('Tab1');
        const EventTab1 = filterConditionEvent('Tab1');
        tableGenerator(JSONArrdataMain.filter(AgeTab1).filter(SexTab1).filter(EventTab1), "Main");
        applyTeamsFilter('#tableResultsMain', 'TeamsFilterMain', 6);
    }
    else if (divId === 'Tab2') {
        const { filterConditionAge: AgeTab2, filterConditionSex: SexTab2 } = filterConditionAgeSex('Tab2');
        const EventTab2 = filterConditionEvent('Tab2');
        tableGenerator(JSONArrdataNS.filter(AgeTab2).filter(SexTab2).filter(EventTab2), "NS");
        applyTeamsFilter('#tableResultsNS', 'TeamsFilterNS', 4);
    }
    else if (divId === 'Tab3') {
        const { filterConditionAge: AgeTab3, filterConditionSex: SexTab3 } = filterConditionAgeSex('Tab3');
        const EventTab3 = filterConditionEvent('Tab3');
        tableGenerator(JSONArrdataQK.filter(AgeTab3).filter(SexTab3).filter(EventTab3), "QK");
        applyTeamsFilter('#tableResultsQK', 'TeamsFilterQK', 4);
    }
    else if (divId === 'Tab5') {
            const { filterConditionAge: AgeTab5, filterConditionSex: SexTab5 } = filterConditionAgeSex('Tab5');
            const EventTab5 = filterConditionEvent('Tab5');
            tableGeneratorDeclarations(JSONArrdataDeclarations.filter(AgeTab5).filter(SexTab5).filter(EventTab5), "Declarations");
            applyTeamsFilter('#tableResultsDeclarations', 'declarations-filter', 4);
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
function renderDeclarationFilterMenu(JSONArr) {  //TO DO after I have fixed JSONDeclarations order
    const container = document.getElementById('declarations-filter-menu');
    if (!container) return;

    const values = [
        ...new Set(
            JSONArr
                .filter(row => row[3] && row[3].trim() != "String")
                .map(row => row[8] && row[8].normalize().trim())
                .filter(v => v)
        )
    ].sort();

    if (TeamsFilterDeclarations != values.length) {
        TeamsFilterDeclarations = values.length;
        let html = '<div class="form-check form-check-inline" style="margin-right:6px;"><label>Teams:</label></div>';
        values.forEach(val => {
            html += `<div class="form-check form-check-inline">
                <input class="form-check-input declarations-filter" type="checkbox" value="${val}" id="declarations-${val}" name="declarations-${val}" checked>
                <label class="form-check-label" for="declarations-${val}">${val}</label>
            </div>`;
        });
        container.innerHTML = html;
    }

    // Individual toggles
    container.querySelectorAll('declarations-filter').forEach(cb => {
        cb.addEventListener('change', function () {
            applyTeamsFilter('#tableResultsDeclarations', 'declarations-filter', 4);
        });
    });
}
function Pof10(id, opt) {
    const tr = id.closest('tr');
    if (!tr) return;
    const tds = tr.getElementsByTagName('td');

    if (tds.length >= 4 && opt=="Main") {
        var fullname = tds[4].textContent.trim();
        var club = tds[6].textContent.trim();
    }

    if (tds.length >= 3 && (opt == "NS" || opt == "QK" || opt == "Declarations")) {
        var fullname = tds[2].textContent.trim();
        var club = tds[4].textContent.trim();
    }
  
    var firstname = fullname.substring(0, fullname.indexOf(' '));
    var surname = fullname.substring(fullname.lastIndexOf(' ') + 1);
    window.open(
        `https://www.thepowerof10.info/athletes/athleteslookup.aspx?surname=${encodeURIComponent(surname)}&firstname=${encodeURIComponent(firstname)}&club=${encodeURIComponent(club)}`, "_blank", "noopener");
    // todo - don't show for relay teams. Also I don't know how to link straight through to the athlete's page, can;t right click in the browser and copy link address
}


async function getFiles() {
    try {
        const response = await fetch(API_ENDPOINTS.list);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        const data = await response.json();
            const name = findNameById(data, Main);
            const el = document.getElementById("Title_Text");
            el.classList.remove("show");     
            el.textContent = formatFilename(name);
                requestAnimationFrame(() => {
                    el.classList.add("show");      // trigger fade-in
                });
         }
         catch (error) {
            console.error("Error fetching JSON:", error); // TODO fix this
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


