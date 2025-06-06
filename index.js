const API_BASE_URL =
    window.location.hostname === ""
        ? "https://localhost:7073" : "https://athleticsresultsapi-drardae4htehawen.ukwest-01.azurewebsites.net"; 

const API_ENDPOINTS = {
    main:   `${API_BASE_URL}/JSONMain`,
    ns:     `${API_BASE_URL}/JSONNS`,
    qk:     `${API_BASE_URL}/JSONQK`,
    scores: `${API_BASE_URL}/JSONScores`
};

var PollingTime = 5; // in minutes
var num = 0;
var numUpdating = "";
var pageLoadTimeoutId = null; 

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
    if (container.querySelector('#U13')?.checked) allowedCategoriesAge.push("U13");
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

        if (i > 0) {                                            // Create a new table if the age or sex changes
            if (JSONArr[i][0] != JSONArr[i - 1][0] || JSONArr[i][1] != JSONArr[i - 1][1]) {
                table += `</tbody></table><table class="table"><tbody>`;
            };
        }

        if (JSONArr[i][3] == "" && JSONArr[i + 1][5] == "") {   // Hide events titles with no recorded athletes
        }
        else if (JSONArr[i][3] == "" & JSONArr[i][1] == "M") {  // Highlight event titles - Boys
            table += '<tr style="background-color: aliceblue;"><td style="background-color: aliceblue;" colspan="6">'
            table += JSONArr[i][4]
            table += '</td></tr>';
        }
        else if (JSONArr[i][3] == "") {                         // Highlight event titles - Girls
            table += '<tr style="background-color: lavenderblush;"><td style="background-color: lavenderblush;" colspan="6">'
            table += JSONArr[i][4]
            table += '</td></tr>';
        }
        else if (JSONArr[i][5] == "") {                         // Hide rows without athletes
        }
        else {
            if (TableOpt == "Main") {                           // Display athletes
                table += `
                <tr>
                    <td style="width:8%">${JSONArr[i][4]}</td>
                    <td style="width:8%">${JSONArr[i][5]}</td>
                    <td style="width:8%">${JSONArr[i][6]}</td>
                    <td style="width:48%">${JSONArr[i][7]}</td>
                    <td style="width:20%">${JSONArr[i][8]}</td>
                    <td style="width:8%">${JSONArr[i][9]}</td>
                </tr>
                `;
            }
            else if (TableOpt == "NS") {
                table += `
                <tr>
                    <td style="width:12%">${JSONArr[i][5]}</td>
                    <td style="width:12%">${JSONArr[i][6]}</td>
                    <td style="width:48%">${JSONArr[i][7]}</td>
                    <td style="width:28%">${JSONArr[i][8]}</td>
                </tr>
                `;
            }
            else if (TableOpt == "QK") {
                table += `
                <tr>
                    <td style="width:12%">${JSONArr[i][5]}</td>
                    <td style="width:12%">${JSONArr[i][6]}</td>
                    <td style="width:48%">${JSONArr[i][7]}</td>
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
    else if (TableOpt == "NS") {
        document.getElementById('tableResultsNS').innerHTML = table;
    }
    else if (TableOpt == "QK") {
        document.getElementById('tableResultsQK').innerHTML = table;
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
function pageLoad() {
    if (numUpdating == "Updating") { }
    else {
        num = PollingTime*60; // declared in seconds
        if (pageLoadTimeoutId) {clearTimeout(pageLoadTimeoutId);}  
        pageLoadTimeoutId = setTimeout(pageLoad, num * 1000);
        numUpdating = "Updating";

        const { filterConditionAge: AgeTab1, filterConditionSex: SexTab1 } = filterConditionAgeSex('Tab1');
        const EventTab1 = filterConditionEvent('Tab1');
        fetch(API_ENDPOINTS.main)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);// TODO fix this
                }
                numUpdating = "";  //TOdo need error message on screen if this is the response
                return response.json();
            })
            .then(data => {
                JSONArrdataMain = data.text;
                tableGenerator(JSONArrdataMain.filter(AgeTab1).filter(SexTab1).filter(EventTab1), "Main");
                numUpdating = "";
            })
            .catch(error => {
                numUpdating = "";
                console.error("Error fetching JSON:", error); // TODO fix this
            });

        const { filterConditionAge: AgeTab2, filterConditionSex: SexTab2 } = filterConditionAgeSex('Tab2');
        const EventTab2 = filterConditionEvent('Tab2');
        fetch(API_ENDPOINTS.ns)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);// TODO fix this
                }
                return response.json();
            })
            .then(data => {
                JSONArrdataNS = data.text;
                tableGenerator(JSONArrdataNS.filter(AgeTab2).filter(SexTab2).filter(EventTab2), "NS");
            })
            .catch(error => {
                console.error("Error fetching JSON:", error); // TODO fix this
            });

        const { filterConditionAge: AgeTab3, filterConditionSex: SexTab3 } = filterConditionAgeSex('Tab3');
        const EventTab3 = filterConditionEvent('Tab3');
        fetch(API_ENDPOINTS.qk)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);// TODO fix this
                }
                return response.json();
            })
            .then(data => {
                JSONArrdataQK = data.text;
                tableGenerator(JSONArrdataQK.filter(AgeTab3).filter(SexTab3).filter(EventTab3), "QK");
            })
            .catch(error => {
                console.error("Error fetching JSON:", error); // TODO fix this
            });

        fetch(API_ENDPOINTS.scores)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);// TODO fix this
                }
                return response.json();
            })
            .then(data => {
                JSONArrdataScores = data.text;
                tableGeneratorScores(JSONArrdataScores);
            })
            .catch(error => {
                console.error("Error fetching JSON:", error); // TODO fix this
            });
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
    }
    else if (divId === 'Tab2') {
        const { filterConditionAge: AgeTab2, filterConditionSex: SexTab2 } = filterConditionAgeSex('Tab2');
        const EventTab2 = filterConditionEvent('Tab2');
        tableGenerator(JSONArrdataNS.filter(AgeTab2).filter(SexTab2).filter(EventTab2), "NS");
    }
    else if (divId === 'Tab3') {
        const { filterConditionAge: AgeTab3, filterConditionSex: SexTab3 } = filterConditionAgeSex('Tab3');
        const EventTab3 = filterConditionEvent('Tab3');
        tableGenerator(JSONArrdataQK.filter(AgeTab3).filter(SexTab3).filter(EventTab3), "QK");
    }
}

// Scroll back to top button functionality
window.onscroll = function () {
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

// collapse top menu
/*document.addEventListener("DOMContentLoaded", function () {
    var tabLinks = document.querySelectorAll('.navbar-collapse .nav > li > a, .navbar-collapse .nav-link');

    tabLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            var navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                var collapseInstance = bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
                collapseInstance.hide();
            }
        });
    });
});*/
