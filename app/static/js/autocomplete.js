const handleUserInput = searchBar => {
    let xhrRequest = new XMLHttpRequest();
    xhrRequest.open("POST", "/autocomplete");
    xhrRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhrRequest.onload = function() {
        if (xhrRequest.readyState === 4 && xhrRequest.status !== 200) {
            alert("Error fetching autocomplete results");
            return;
        }

        // Fill autocomplete with fetched results
        let autocompleteResults = JSON.parse(xhrRequest.responseText);
        autocomplete(searchBar, autocompleteResults[1]);
    };

    xhrRequest.send('q=' + searchBar.value);
};

const autocomplete = (searchInput, autocompleteResults) => {
    let currentFocus;

    searchInput.addEventListener("input", function () {
        let autocompleteList, autocompleteItem, i, val = this.value;
        closeAllLists();

        if (!val || !autocompleteResults) {
            return false;
        }

        currentFocus = -1;
        autocompleteList = document.createElement("div");
        autocompleteList.setAttribute("id", this.id + "-autocomplete-list");
        autocompleteList.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(autocompleteList);

        for (i = 0; i < autocompleteResults.length; i++) {
            if (autocompleteResults[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                autocompleteItem = document.createElement("div");
                autocompleteItem.innerHTML = "<strong>" + autocompleteResults[i].substr(0, val.length) + "</strong>";
                autocompleteItem.innerHTML += autocompleteResults[i].substr(val.length);
                autocompleteItem.innerHTML += "<input type=\"hidden\" value=\"" + autocompleteResults[i] + "\">";
                autocompleteItem.addEventListener("click", function () {
                    searchInput.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                    document.getElementById("search-form").submit();
                });
                autocompleteList.appendChild(autocompleteItem);
            }
        }
    });

    searchInput.addEventListener("keydown", function (e) {
        let suggestion = document.getElementById(this.id + "-autocomplete-list");
        if (suggestion) suggestion = suggestion.getElementsByTagName("div");
        if (e.keyCode === 40) { // down
            currentFocus++;
            addActive(suggestion);
        } else if (e.keyCode === 38) { //up
            currentFocus--;
            addActive(suggestion);
        } else if (e.keyCode === 13) { // enter
            e.preventDefault();
            if (currentFocus > -1) {
                if (suggestion) suggestion[currentFocus].click();
            }
        }
    });

    const addActive = suggestion => {
        if (!suggestion || !suggestion[currentFocus]) return false;
        removeActive(suggestion);

        if (currentFocus >= suggestion.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (suggestion.length - 1);

        suggestion[currentFocus].classList.add("autocomplete-active");
    };

    const removeActive = suggestion => {
        for (let i = 0; i < suggestion.length; i++) {
            suggestion[i].classList.remove("autocomplete-active");
        }
    };

    const closeAllLists = el => {
        let suggestions = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < suggestions.length; i++) {
            if (el !== suggestions[i] && el !== searchInput) {
                suggestions[i].parentNode.removeChild(suggestions[i]);
            }
        }
    };

    // Close lists and search when user selects a suggestion
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
};