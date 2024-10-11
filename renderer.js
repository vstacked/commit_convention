$(async function () {
    const $geminiApiKeyFieldOverlay = $("#gemini-api-key-field-overlay");
    const $geminiApiKeyField = $("#gemini-api-key-field");
    const $profile = $("#profile");
    const $result = $("#result");
    const $generatingOverlay = $("#generating-overlay");
    const $geminiApiKey = $("#gemini-api-key");
    const $gemini = $("#gemini");
    const $resultButton = $("#result-button");
    const $resultButtonGemini = $("#result-button-gemini");
    const $clear = $("#clear");
    const $copyPlain = $("#copy-plain");
    const $copyGit = $("#copy-git");
    const $cancel = $("#cancel");
    const $retry = $("#retry");
    const $apply = $("#apply");
    const $type = $('input[type="radio"]');
    const $typeAlert = $('#type-alert');
    const $scope = $("#scope");
    const $description = $("#description");
    const $body = $("#body");
    const $footer = $("#footer");

    let profiles = await window.store.getProfiles()
    let profileUsed = await window.store.getProfileUsed()

    const profileName = profiles[profileUsed].profile

    $profile.on("click", () => {
        void window.profile.toggle();
    })
    $("<p>").addClass("profile-used").append(profileName).insertAfter("#" + $profile.attr("id") + " svg")

    const scopeRegex = /\((.*?)\):/;
    const n = "\n"
    const geminiActiveHex = "rgb(238, 238, 238)"

    let actualResult;
    let type;
    let geminiApiKey;

    async function refetchLocal() {
        profiles = await window.store.getProfiles()
        profileUsed = await window.store.getProfileUsed()
    }

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

    function isGeminiApiKeyFieldActive() {
        return $geminiApiKeyFieldOverlay.css("display") !== "none"
    }

    function isGeminiActive() {
        return $gemini.css("background-color") === geminiActiveHex
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

    function selectType(val) {
        $(".autocomplete-items").remove()

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
            } else {
                radio.parent().show(300)
            }
        })
    }

    function typeStatus(enabled) {
        $type.prop("disabled", !enabled)
        $(".type-select, .type-select label, .type input[type='radio']").css({ cursor: enabled ? "auto" : "not-allowed" })
    }

    function cancelGemini() {
        $gemini.css("background-color", "#222831")
        $result.html(actualResult)

        $resultButton.show()
        $resultButtonGemini.hide()

        fieldStatus(true)
        typeStatus(true)
    }

    // initial
    fieldStatus(false)
    $geminiApiKeyFieldOverlay.hide()
    $generatingOverlay.hide()
    $resultButtonGemini.hide()
    $gemini.css({ cursor: "not-allowed" })

    // Create an observer instance
    const observerResult = new MutationObserver(function (mutations) {
        const enabled = $result.html().length !== 0

        // control field status when gemini is inactive
        if (!isGeminiActive()) {
            fieldStatus(enabled)
        }

        if (type.length > 0 && $description.val().length > 0) {
            $gemini.css({ cursor: "pointer" })
        } else {
            $gemini.css({ cursor: "not-allowed" })
        }
    });

    // Pass in the target node, as well as the observer options
    observerResult.observe($result[0], {
        attributes: true,
        childList: true,
        characterData: true
    });

    $geminiApiKey.on("click", async function () {
        $geminiApiKeyFieldOverlay.show()
        $('html, body')
            .css("overflow-y", "hidden")
            .animate({ scrollTop: 0 })

        const apiKey = await window.store.getGeminiApiKey()
        $geminiApiKeyField.val(apiKey)
    })

    $geminiApiKeyField.on('propertychange input', async function (e) {
        var valueChanged = false;

        if (e.type == 'propertychange') {
            valueChanged = e.originalEvent.propertyName == 'value';
        } else {
            valueChanged = true;
        }

        if (!valueChanged) return;

        geminiApiKey = e.target.value
    });

    $gemini.on("click", async function () {
        const t = $(this)

        if (t.css("cursor") === "not-allowed") {
            return
        }

        if (isGeminiActive()) {
            cancelGemini()
        } else {
            t.css("background-color", geminiActiveHex)
            actualResult = $result.html()

            $generatingOverlay.show()

            const result = await window.gemini.sendMessage(actualResult)
            $result.html(result)

            $resultButton.hide()
            $resultButtonGemini.show()

            typeStatus(false)
            fieldStatus(false)

            $generatingOverlay.hide()
        }
    })

    $cancel.on("click", function () {
        cancelGemini()
    })

    $retry.on("click", async function () {
        $generatingOverlay.show()

        const result = await window.gemini.sendMessage(actualResult)
        $result.html(result)

        $generatingOverlay.hide()
    })

    $apply.on("click", async function () {
        const geminiResult = $result.find("pre").text()

        const types = ["feat", "fix", "refactor", "perf", "style", "test", "docs", "build", "chore", "ops", "wip"]
        const regex = /^(?<type>feat|fix|refactor|perf|style|test|docs|build|chore|ops|wip)(?:\((?<scope>[^)]+)\))?: (?<description>[^\n]+)(?:\n\n(?<body>[^\n][\s\S]*?))?(?:\n\n(?<footer>[^\n][\s\S]*?))?$/;

        function trimTrailingNewlines(text) {
            if (text) {
                return text.replace(/\n+$/, '');
            }
            return undefined
        }

        const match = trimTrailingNewlines(geminiResult).match(regex)

        if (!match) return

        const { type, scope, description, body, footer } = match.groups

        $scope.val(trimTrailingNewlines(scope));
        $description.val(trimTrailingNewlines(description));
        $body.val(trimTrailingNewlines(body));
        $footer.val(trimTrailingNewlines(footer));

        const radioType = $type.eq(types.findIndex(e => e === type) + 1)
        if (!radioType.prop("checked")) {
            selectType(radioType.prop("checked", true).val())
        }

        setTimeout(() => {
            $result.html(type + getScope() + getDescription() + getBody() + getFooter())
        }, 0);

        cancelGemini()
    })

    $clear.on("click", async function () {
        await initAutocomplete()

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
        const copyText = $result.text().replaceAll(n, "\n");

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
        selectType(val)
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

            let indexBg = 0

            for (let index = 0; index < arr.length; index++) {
                const text = arr[index];

                if (text.substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                    $("<div>")
                        .addClass("autocomplete-items-child")
                        .css(indexBg % 2 == 1 ? { "background": "#222831" } : {})
                        .append(
                            $("<pre>")
                                .html("<strong>" + text.substr(0, val.length) + "</strong>")
                                .append(text.substr(val.length))
                                .append($("<input>").attr({ type: "hidden" }).val(text))
                        )
                        .on("click", function () {
                            const selected = $(this).find("input").val()
                            $(inp).val(selected)
                            cb(selected)
                            closeAllLists()
                        }).appendTo($(parent))
                    indexBg++;
                }
            }

            // hide autocomplete when result is empty
            if (!$(parent).find("pre").length) {
                $(parent).hide();
            }
        });

        $(inp).on("keydown", function (e) {
            let children = $("#" + this.id + "autocomplete-list div")

            if (e.ctrlKey && e.code === "Space") { // Ctrl + Space
                if (!arr.length) return

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
                        .append(
                            $("<pre>")
                                .append(text)
                                .append($("<input>").attr({ type: "hidden" }).val(text))
                        )
                        .on("click", function () {
                            const selected = $(this).find("input").val()
                            $(inp).val(selected)
                            cb(selected)
                            closeAllLists()
                        })
                        .appendTo($(parent))
                }
            } else if (e.key === "Escape") {
                closeAllLists()
            } else if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "j")) {
                currentFocus++;
                addActive(children);
                scrollToBottom()
            } else if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "k")) {
                currentFocus--;
                addActive(children);
            } else if (e.key === "Enter") {
                if (currentFocus > -1) {
                    e.preventDefault();
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

        function closeAllLists() {
            $(".autocomplete-items").remove()
        }

        $(document).on("click", function (e) {
            e.stopImmediatePropagation();
            closeAllLists();
        })
    }

    async function getAutocomplete(key) {
        return window.store.getContent({ id: profileUsed, key })
    }

    async function initAutocomplete() {
        await refetchLocal();
        $(".autocomplete-items").remove()

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

    $('html, body').on("keyup", function (e) {
        e.stopImmediatePropagation();

        if (isGeminiApiKeyFieldActive()) {
            if (e.key === "Escape" || e.key === "Enter") {
                if (geminiApiKey) {
                    window.store.setGeminiApiKey(geminiApiKey);
                }

                $geminiApiKeyFieldOverlay.hide()
                $('html, body').css("overflow-y", "auto")
            }

            return
        }

        if (isGeminiActive()) {
            typeStatus(false)
            return
        }

        if (e.ctrlKey && e.key === "1") {
            selectType($type.eq(1).prop("checked", true).val())
        } else if (e.ctrlKey && e.key === "2") {
            selectType($type.eq(2).prop("checked", true).val())
        } else if (e.ctrlKey && e.key === "3") {
            selectType($type.eq(3).prop("checked", true).val())
        } else if (e.ctrlKey && e.key === "4") {
            selectType($type.eq(4).prop("checked", true).val())
        } else if (e.ctrlKey && e.key === "5") {
            selectType($type.eq(5).prop("checked", true).val())
        } else if (e.ctrlKey && e.key === "6") {
            selectType($type.eq(6).prop("checked", true).val())
        } else if (e.ctrlKey && e.key === "7") {
            selectType($type.eq(7).prop("checked", true).val())
        } else if (e.ctrlKey && e.key === "8") {
            selectType($type.eq(8).prop("checked", true).val())
        } else if (e.ctrlKey && e.key === "9") {
            selectType($type.eq(9).prop("checked", true).val())
        } else if (e.ctrlKey && e.key === "0") {
            selectType($type.eq(10).prop("checked", true).val())
        }
    })
})
