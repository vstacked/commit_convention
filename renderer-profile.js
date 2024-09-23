$(async function () {
    const close = $("#close");
    const collapsibleParent = $("#collapsible-parent");
    const addProfileInput = $("#add-profile-input");
    const inlineAlert = $(".inline-alert")

    const safeCharactersRegex = /^[A-Za-z0-9._():@-]+$/

    let addProfileText = ""

    close.on("click", () => {
        window.profile.toggle();
    })

    $('html, body').on("keyup", function (e) {
        e.stopImmediatePropagation();

        if (e.key === "Escape") {
            window.profile.toggle();
        }
    })

    let profiles = await window.store.getProfiles()
    let profileUsed = await window.store.getProfileUsed()

    async function refetchLocal() {
        profiles = await window.store.getProfiles()
        profileUsed = await window.store.getProfileUsed()
    }

    function generateProfileList() {
        // Prefixes:
        // - p: for profile name component related
        // - c: for content component related
        for (let id in profiles) {
            const isDefaultProfile = id === "default";

            const isApplied = profileUsed === id;

            const item = profiles[id]
            const profileName = item.profile

            function hasProjectNameChanged() {
                return pInput.val() !== profileName;
            }

            function resetEditButton() {
                if (pProfile.hasClass("active")) {
                    pBtnAction.html("Hide")
                    pBtnApply.show()
                } else {
                    pBtnAction.html("Show")
                }

                pBtnAction.addClass("button-action").removeClass("button-crud")
                pBtnDelete.show()
                pBtnCancelEdit.hide()
                inlineAlert.html("")
            }

            function resetDeleteProfileButton() {
                pBtnCancelDelete.hide()
                pBtnDelete.removeClass("delete-profile")
            }

            function showContent() {
                pProfile.addClass("active")
                cContent.show()
                pBtnAction.html("Hide")

                pBtnApply.show()
            }

            const pInput = $("<input>")
                .val(profileName)
                .attr({ type: "text" })
                .prop("disabled", isDefaultProfile)
                .on("focusout", () => {
                    if (!hasProjectNameChanged()) {
                        resetEditButton()
                    }
                })
                .on('propertychange input', function (e) {
                    var valueChanged = false;

                    if (e.type == 'propertychange') {
                        valueChanged = e.originalEvent.propertyName == 'value';
                    } else {
                        valueChanged = true;
                    }

                    if (!valueChanged) return;

                    if (hasProjectNameChanged()) {
                        pBtnAction.html("Edit")
                        pBtnAction.removeClass("button-action").addClass("button-crud")
                        pBtnCancelEdit.show()
                        pBtnApply.hide()
                        pBtnDelete.hide()
                        resetDeleteProfileButton()
                    }
                })


            const pBtnCancelEdit = $("<button>")
                .addClass("button-crud")
                .attr({ type: "button" })
                .append("Cancel")
                .hide()
                .on("click", () => {
                    pInput.val(profileName)
                    resetEditButton()
                })

            const pBtnCancelDelete = $("<button>")
                .addClass("button-crud")
                .attr({ type: "button" })
                .append("Cancel")
                .hide()
                .on("click", () => {
                    resetDeleteProfileButton()
                })

            const pBtnDelete = $("<button>")
                .addClass("button-crud")
                .attr({ type: "button" })
                .append("Delete Profile")
                .on("click", async () => {
                    if (pBtnDelete.hasClass("delete-profile")) {
                        await window.store.deleteProfile(id)
                        await rerenderCollapsibleChild()

                        resetDeleteProfileButton()
                    } else {
                        pBtnDelete.addClass("delete-profile")
                        pBtnCancelDelete.show()
                    }
                })

            const pBtnAction = $("<button>")
                .addClass("p-btn-action")
                .attr({ type: "button" })
                .append("Show")
                .on("click", async () => {
                    if (hasProjectNameChanged()) {
                        const newName = pInput.val()

                        if (!safeCharactersRegex.test(newName)) {
                            inlineAlert.html("Input contains invalid characters. Please use only letters, numbers, and the following symbols: . _ ( ) : @ -")
                            return
                        }

                        await window.store.renameProfile({ id, newName })
                        await rerenderCollapsibleChild()

                        resetEditButton()
                        return
                    }

                    if (cContent.css("display") === "block") {
                        pProfile.removeClass("active")
                        cContent.hide()
                        pBtnAction.html("Show")

                        showedProfile = id;

                        pBtnApply.hide()
                    } else {
                        showContent()

                        const otherTitle = $(".collapsible")
                        const otherContent = $(".content")
                        const otherBtnActionTitle = $(".p-btn-action")
                        const otherBtnApplyProfile = $(".p-btn-apply")
                        otherTitle.not(pProfile).removeClass("active")
                        otherContent.not(cContent).hide()
                        otherBtnActionTitle.not(pBtnAction).html("Show")
                        otherBtnApplyProfile.not(pBtnApply).hide()

                        $('html, body').animate({
                            scrollTop: collapsibleChild.offset().top - 40
                        }, 250)
                    }
                })

            const pBtnApply = $("<button>")
                .addClass("p-btn-apply")
                .addClass(isApplied ? "button-applied-profile" : "button-apply-profile")
                .attr({ type: "button" })
                .prop("disabled", isApplied)
                .append(isApplied ? "Applied" : "Apply Profile")
                .hide()
                .on("click", async () => {
                    await window.store.applyProfile(id)
                    await rerenderCollapsibleChild()
                })

            const pBtn = isDefaultProfile
                ? $("<div>")
                    .addClass("row")
                    .append(pBtnAction)
                    .append(pBtnApply)
                : isApplied ?
                    $("<div>")
                        .addClass("row")
                        .append(pBtnCancelEdit)
                        .append(pBtnAction)
                        .append(pBtnApply)
                    : $("<div>")
                        .addClass("row")
                        .append(pBtnCancelDelete)
                        .append(pBtnDelete)
                        .append(pBtnCancelEdit)
                        .append(pBtnAction)
                        .append(pBtnApply)


            const pProfile = $("<div>")
                .addClass("collapsible")
                .append(pInput)
                .append(pBtn)

            // ---------------------------------------------------------------------
            // ---------------------------------------------------------------------

            function contentItem(key, index, text, appendTo, generate) {
                function resetDeleteContentButton() {
                    cBtnCancel.hide()
                    cBtnDelete.removeClass("delete-content")
                }

                const cBtnCancel = $("<button>")
                    .addClass("button-crud")
                    .attr({ type: "button" })
                    .append("Cancel")
                    .hide()
                    .on("click", () => {
                        resetDeleteContentButton()
                    })

                const cBtnDelete = $("<button>")
                    .addClass("button-crud")
                    .attr({ type: "button" })
                    .html("Delete")
                    .on("click", () => {
                        if (cBtnDelete.hasClass("delete-content")) {
                            resetDeleteContentButton()

                            void window.store.deleteContent({
                                id: profileUsed,
                                key,
                                content: text,
                            }).then(async () => {
                                await refetchLocal()
                                $("." + key + "-list div").remove()
                                generate()
                            })
                        } else {
                            cBtnDelete.addClass("delete-content")
                            cBtnCancel.show()
                        }
                    })

                const cBtn = $("<div>")
                    .addClass("row")
                    .append(cBtnCancel)
                    .append(cBtnDelete)


                $("<div>")
                    .addClass("content-item")
                    .addClass("row")
                    .css(index % 2 == 1 ? { "background": "#222831" } : {})
                    .append($("<span>").html(text))
                    .append(cBtn)
                    .appendTo(appendTo)
            }

            const cScope = $("<div>")
                .addClass("scope-list")
                .append($("<h3>").html("Scope"))
            function generateScope() {
                const dataScope = profiles[id].scope;
                const lenScope = dataScope.length;
                for (let i = 0; i < lenScope; i++) {
                    const text = dataScope[i];
                    contentItem("scope", i, text, cScope, generateScope)
                }
            }
            generateScope()

            const cDescription = $("<div>")
                .addClass("description-list")
                .append($("<h3>").html("Description"))
            function generateDescription() {
                const dataDescription = profiles[id].description;
                const lenDescription = dataDescription.length;
                for (let i = 0; i < lenDescription; i++) {
                    const text = dataDescription[i];
                    contentItem("description", i, text, cDescription, generateDescription)
                }
            }
            generateDescription()

            const cBody = $("<div>")
                .addClass("body-list")
                .append($("<h3>").html("Body"))
            function generateBody() {
                const dataBody = profiles[id].body;
                const lenBody = dataBody.length;
                for (let i = 0; i < lenBody; i++) {
                    const text = dataBody[i];
                    contentItem("body", i, text, cBody, generateBody)
                }
            }
            generateBody()

            const cFooter = $("<div>")
                .addClass("footer-list")
                .append($("<h3>").html("Footer"))
            function generateFooter() {
                const dataFooter = profiles[id].footer;
                const lenFooter = dataFooter.length;
                for (let i = 0; i < lenFooter; i++) {
                    const text = dataFooter[i];
                    contentItem("footer", i, text, cFooter, generateFooter)
                }
            }
            generateFooter()

            const cContent = $("<div>")
                .addClass("content")
                .append(cScope)
                .append(cDescription)
                .append(cBody)
                .append(cFooter)

            const collapsibleChild = $("<div>")
                .addClass("collapsible-child")
                .append(pProfile)
                .append(cContent)
                .appendTo(collapsibleParent)

            // show content in initial open window
            if (isApplied) showContent()
        }
    }
    generateProfileList()

    async function rerenderCollapsibleChild() {
        await refetchLocal()
        $(".collapsible-child").remove();
        generateProfileList()
    }

    addProfileInput
        .on('propertychange input', async function (e) {
            var valueChanged = false;

            if (e.type == 'propertychange') {
                valueChanged = e.originalEvent.propertyName == 'value';
            } else {
                valueChanged = true;
            }

            if (!valueChanged) return;

            addProfileText = await window.secureApi.sanitizeInput(e.target.value)
        })
        .on("focus", (e) => {
            const btnCancel = $("<button>")
                .addClass("button-crud")
                .attr({ type: "button" })
                .append("Cancel")
                .on("click", () => {
                    addProfileText = ""
                    addProfileInput.val("")
                    inlineAlert.html("")
                    btns.remove()
                })

            const btnSave = $("<button>")
                .addClass("button-crud")
                .attr({ type: "button" })
                .html("Save")
                .on("click", async () => {
                    if (!safeCharactersRegex.test(addProfileText)) {
                        inlineAlert.html("Input contains invalid characters. Please use only letters, numbers, and the following symbols: . _ ( ) : @ -")
                        return
                    }

                    await window.store.addProfile(addProfileText);
                    await rerenderCollapsibleChild()

                    addProfileText = ""
                    addProfileInput.val("")
                    inlineAlert.html("")
                    btns.remove()
                })

            const btns = $("<div>")
                .addClass("row")
                .addClass("add-profile-btns")
                .append(btnCancel)
                .append(btnSave)

            if (!$("div").hasClass("add-profile-btns")) {
                btns.insertAfter(addProfileInput)
            }
        })
})