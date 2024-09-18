$(function () {
    const $profile = $("#profile");
    const $result = $("#result");
    const $clear = $("#clear");
    const $copy = $("#copy");
    const $inlineAlert = $("#inline-alert");
    const $type = $('input[type="radio"]');
    const $scope = $("#scope");
    const $description = $("#description");
    const $body = $("#body");
    const $footer = $("#footer");

    $profile.on("click", () => {
        window.profile.toggle();
    })

    const scopeRegex = /\((.*?)\):/;
    const n = "<br>"

    let type;

    function getScope() {
        return $scope.val().length !== 0 ? `(${$scope.val()}): ` : ": "
    }

    function getDescription() {
        return $description.val().length !== 0 ? $description.val() : ""
    }

    function getBody() {
        return $body.val().length !== 0 ? n + n + $body.val() : ""
    }

    function getFooter() {
        return $footer.val().length !== 0 ? n + n + $footer.val() : ""
    }

    function fieldStatus(enabled) {
        $scope.prop('disabled', !enabled)
        $description.prop('disabled', !enabled)
        $body.prop('disabled', !enabled)
        $footer.prop('disabled', !enabled)
    }

    function handleScope(scope) {
        const original = $result.html();

        const head = type;
        const tail = getDescription() + getBody() + getFooter();

        if (scope.length === 0) {
            $result.html(head + ": " + tail)
            return
        }

        const match = original.match(scopeRegex);

        if (match) {
            const [_, insideParentheses] = match;
            $result.html(head + `(${scope || insideParentheses}): ` + tail)
        } else {
            $result.html(head + `(${scope}): ` + tail)
        }
    }

    function handleDescription(description) {
        const head = type + getScope();
        const tail = getBody() + getFooter();

        if (description.length === 0) {
            $result.html(head + tail)
            return
        }

        $result.html(head + description + tail)
    }

    function handleBody(body) {
        const head = type + getScope() + getDescription();
        const tail = getFooter();

        if (body.length === 0) {
            $result.html(head + tail)
            return
        }

        $result.html(head + n + n + body + tail)
    }

    function handleFooter(footer) {
        const head = type + getScope() + getDescription() + getBody();

        if (footer.length === 0) {
            $result.html(head)
            return
        }

        $result.html(head + n + n + footer)
    }

    // initial
    fieldStatus(false)

    // Create an observer instance
    const observerResult = new MutationObserver(function (mutations) {
        const enabled = $result.html().length !== 0
        fieldStatus(enabled)
    });

    // Pass in the target node, as well as the observer options
    observerResult.observe($result[0], {
        attributes: true,
        childList: true,
        characterData: true
    });

    $clear.on("click", function () {
        $result.html("")
        $type.prop("checked", false)
        $inlineAlert.html("")
        type = ""
        $scope.val("")
        $description.val("")
        $body.val("")
        $footer.val("")
    })

    $copy.on("click", function () {
        const copyText = $result.html().replaceAll(n, "\n");

        if (copyText.length === 0) {
            return
        }

        navigator.clipboard.writeText(copyText);

        $inlineAlert.show()
        $inlineAlert.html("Copied!");
        setTimeout(() => {
            $inlineAlert.hide()
        }, 1000);
    })

    $type.on("click", function () {
        const val = $(this).val();

        const tail = getScope() + getDescription() + getBody() + getFooter();

        type = val
        $result.html(val + tail);
    });

    $scope.on('propertychange input', async function (e) {
        var valueChanged = false;

        if (e.type == 'propertychange') {
            valueChanged = e.originalEvent.propertyName == 'value';
        } else {
            valueChanged = true;
        }

        if (!valueChanged) return;

        const scope = await window.secureApi.sanitizeInput(e.target.value);
        handleScope(scope)
    });

    $description.on('propertychange input', async function (e) {
        var valueChanged = false;

        if (e.type == 'propertychange') {
            valueChanged = e.originalEvent.propertyName == 'value';
        } else {
            valueChanged = true;
        }

        if (!valueChanged) return;

        const description = await window.secureApi.sanitizeInput(e.target.value);
        handleDescription(description)
    });

    $body.on('propertychange input', async function (e) {
        var valueChanged = false;

        if (e.type == 'propertychange') {
            valueChanged = e.originalEvent.propertyName == 'value';
        } else {
            valueChanged = true;
        }

        if (!valueChanged) return;

        const body = await window.secureApi.sanitizeInput(e.target.value);
        handleBody(body)
    });

    $footer.on('propertychange input', async function (e) {
        var valueChanged = false;

        if (e.type == 'propertychange') {
            valueChanged = e.originalEvent.propertyName == 'value';
        } else {
            valueChanged = true;
        }

        if (!valueChanged) return;

        const footer = await window.secureApi.sanitizeInput(e.target.value);
        handleFooter(footer)
    });

    // https://www.w3schools.com/howto/howto_js_autocomplete.asp
    function autocomplete(inp, arr, cb) {
        let currentFocus;

        $(inp).on('propertychange input', async function (e) {
            let valueChanged = false;

            if (e.type == 'propertychange') {
                valueChanged = e.originalEvent.propertyName == 'value';
            } else {
                valueChanged = true;
            }

            if (!valueChanged) return;

            let val = await window.secureApi.sanitizeInput($(this).val());

            closeAllLists();
            if (!val) { return }

            currentFocus = -1;

            let parent = $("<div>")
                .attr({ id: this.id + "autocomplete-list" })
                .addClass("autocomplete-items")
                .insertAfter($(this))

            for (let index = 0; index < arr.length; index++) {
                const text = arr[index];

                if (text.substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                    $("<div>")
                        .html("<strong>" + text.substr(0, val.length) + "</strong>")
                        .append(text.substr(val.length))
                        .append($("<input>").attr({ type: "hidden" }).val(text))
                        .on("click", function () {
                            const selected = $(this).find("input").val()
                            $(inp).val(selected)
                            cb(selected)
                            closeAllLists()
                        }).appendTo($(parent))
                }
            }

            // hide autocomplete when result is empty
            if (!$(parent).find("div").length) {
                $(parent).hide();
            }
        });

        $(inp).on("keydown", function (e) {
            let children = $("#" + this.id + "autocomplete-list div")

            if (e.key === "ArrowDown") {
                currentFocus++;
                addActive(children);
            } else if (e.key === "ArrowUp") {
                currentFocus--;
                addActive(children);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (currentFocus > -1) {
                    $(children).eq(currentFocus).trigger("click")
                }
            }
        })

        function addActive(children) {
            if (!children) return false;

            removeActive(children);

            if (currentFocus >= children.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (children.length - 1);

            $(children).eq(currentFocus).addClass("autocomplete-active")
        }

        function removeActive(children) {
            $(children).removeClass("autocomplete-active")
        }

        function closeAllLists(elmnt) {
            $(".autocomplete-items").not(elmnt).not(inp).remove()
        }

        $(document).on("click", function (e) {
            closeAllLists(e.target);
        })
    }

    autocomplete($scope, [], function (selected) {
        handleScope(selected)
    });

    autocomplete($description, [], function (selected) {
        handleDescription(selected)
    });

    autocomplete($body, [], function (selected) {
        handleBody(selected)
    });

    autocomplete($footer, [], function (selected) {
        handleFooter(selected)
    });
})
