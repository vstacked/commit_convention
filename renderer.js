$(async function () {
    const $profile = $("#profile");
    const $result = $("#result");
    const $clear = $("#clear");
    const $copyPlain = $("#copy-plain");
    const $copyGit = $("#copy-git");
    const $type = $('input[type="radio"]');
    const $typeAlert = $('#type-alert');
    const $scope = $("#scope");
    const $description = $("#description");
    const $body = $("#body");
    const $footer = $("#footer");

    const profiles = await window.store.getProfiles()
    const profileUsed = await window.store.getProfileUsed()

    const profileName = profiles[profileUsed].profile

    $profile.on("click", () => {
        void window.profile.toggle();
    })
    $("<p>").addClass("profile-used").append(profileName).insertAfter("#" + $profile.attr("id") + " svg")

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

    function scrollToBottom() {
        $("html, body").animate({ scrollTop: $(document).height() }, 500);
    }

    function showInlineAlert() {
        $(".inline-alert").remove()

        $("<span>")
            .addClass("inline-alert")
            .append("Copied!")
            .insertAfter(".result")

        setTimeout(() => {
            $(".inline-alert").remove()
        }, 1000);
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
        $(".inline-alert").remove()
        type = ""
        $scope.val("")
        $description.val("")
        $body.val("")
        $footer.val("")

        $typeAlert.show()

        $type.each(function () {
            const radio = $(this)
            radio.parent().show(300)
        })
    })

    $copyPlain.on("click", function () {
        const copyText = $result.html().replaceAll(n, "\n");

        if (copyText.length === 0) {
            return
        }

        navigator.clipboard.writeText(copyText);

        showInlineAlert()

        void window.store.saveContent({
            id: profileUsed,
            scope: $scope.val(),
            description: $description.val(),
            body: $body.val(),
            footer: $footer.val(),
        }).then(() => {
            void initAutocomplete()
        })
    })

    $copyGit.on("click", function () {
        if ($result.html().length === 0) {
            return
        }

        const first = type + getScope() + getDescription();
        const second = !!getBody().length ? " -m \"" + getBody().replaceAll(n, "") + "\"" : "";
        const third = !!getFooter().length ? " -m \"" + getFooter().replaceAll(n, "") + "\"" : "";

        const git = "git commit -m \"" + first + "\"" + second + third;

        navigator.clipboard.writeText(git);

        showInlineAlert()

        void window.store.saveContent({
            id: profileUsed,
            scope: $scope.val(),
            description: $description.val(),
            body: $body.val(),
            footer: $footer.val(),
        }).then(() => {
            void initAutocomplete()
        })
    })

    $type.on("click", function () {
        const val = $(this).val();

        if (val === type) {
            $result.html("")
            $type.prop("checked", false)
            type = ""
            fieldStatus(false)

            $typeAlert.show()

            $type.each(function () {
                const radio = $(this)
                if (radio.val() !== val) {
                    radio.parent().show(300)
                }
            })
            return
        }

        const tail = getScope() + getDescription() + getBody() + getFooter();

        type = val
        $result.html(val + tail);

        $typeAlert.hide()

        $type.each(function () {
            const radio = $(this)
            if (radio.val() !== val) {
                radio.parent().hide(300)
            }
        })
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
                        .addClass("autocomplete-items-child")
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

            scrollToBottom()
        });

        $(inp).on("keydown", function (e) {
            let children = $("#" + this.id + "autocomplete-list div")

            if (e.ctrlKey && e.code === "Space") { // Ctrl + Space
                if (!!$(this).parent().find("#" + this.id + "autocomplete-list").length) {
                    return
                }

                closeAllLists()

                currentFocus = -1;

                let parent = $("<div>")
                    .attr({ id: this.id + "autocomplete-list" })
                    .addClass("autocomplete-items")
                    .insertAfter($(this))
                for (let index = 0; index < arr.length; index++) {
                    const text = arr[index];
                    $("<div>")
                        .addClass("autocomplete-items-child")
                        .css(index % 2 == 1 ? { "background": "#222831" } : {})
                        .append(text)
                        .append($("<input>").attr({ type: "hidden" }).val(text))
                        .on("click", function () {
                            const selected = $(this).find("input").val()
                            $(inp).val(selected)
                            cb(selected)
                            closeAllLists()
                        })
                        .appendTo($(parent))
                }

                scrollToBottom()
            } else if (e.key === "Escape") {
                closeAllLists()
            } else if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "j")) {
                currentFocus++;
                addActive(children);
            } else if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "k")) {
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

            const parent = $(".autocomplete-items")
            const focused = $(children).eq(currentFocus)

            parent.scrollTop(parent.scrollTop() + focused.position().top)

            focused.addClass("autocomplete-active")
        }

        function removeActive(children) {
            $(children).removeClass("autocomplete-active")
        }

        function closeAllLists(elmnt) {
            $(".autocomplete-items").remove()
        }

        $(document).on("click", function (e) {
            closeAllLists(e.target);
        })
    }

    async function getAutocomplete(key) {
        return window.store.getContent({ id: profileUsed, key })
    }

    async function initAutocomplete() {
        autocomplete($scope, await getAutocomplete("scope"), function (selected) {
            handleScope(selected)
        });

        autocomplete($description, await getAutocomplete("description"), function (selected) {
            handleDescription(selected)
        });

        autocomplete($body, await getAutocomplete("body"), function (selected) {
            handleBody(selected)
        });

        autocomplete($footer, await getAutocomplete("footer"), function (selected) {
            handleFooter(selected)
        });
    }

    void initAutocomplete()
})
