$(function () {
    const close = $("#close");
    const collapsibleParent = $("#collapsible-parent");
    const addProfileInput = $("#add-profile-input");
    const inlineAlert = $(".inline-alert")

    const safeCharactersRegex = /^[A-Za-z0-9._():@-]+$/

    let addProfileText = ""

    close.on("click", () => {
        window.profile.toggle();
    })

    const r = [
        "Ducimus qui accusantium ut ut ut illum.",
        "Sed aliquam quia sit voluptas non quia.",
        "Possimus pariatur iste et vitae officia sed.",
        "Neque voluptas enim quidem qui velit nobis mollitia eveniet voluptatem.",
    ]

    // Prefixes:
    // - p: for profile name component related
    // - c: for content component related
    for (let index = 0; index < r.length; index++) {
        const profileName = "Open Section " + (index + 1)

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

            pBtnCancel.hide()
        }


        const pInput = $("<input>")
            .val(profileName)
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
                    pBtnCancel.show()
                    pBtnApply.hide()
                }
            })


        const pBtnCancel = $("<button>")
            .attr({ type: "button" })
            .append("Cancel")
            .hide()
            .on("click", () => {
                pInput.val(profileName)
                resetEditButton()
            })

        const pBtnAction = $("<button>")
            .addClass("p-btn-action")
            .attr({ type: "button" })
            .append("Show")
            .on("click", () => {
                if (hasProjectNameChanged()) {
                    // TODO: update title to local
                    resetEditButton()
                    return
                }

                if (cContent.css("display") === "block") {
                    pProfile.removeClass("active")
                    cContent.hide()
                    pBtnAction.html("Show")

                    pBtnApply.hide()
                } else {
                    pProfile.addClass("active")
                    cContent.show()
                    pBtnAction.html("Hide")

                    pBtnApply.show()

                    const otherTitle = $(".collapsible")
                    const otherContent = $(".content")
                    const otherBtnActionTitle = $(".p-btn-action")
                    const otherBtnApplyProfile = $(".p-btn-apply")
                    otherTitle.not(pProfile).removeClass("active")
                    otherContent.not(cContent).hide()
                    otherBtnActionTitle.not(pBtnAction).html("Show")
                    otherBtnApplyProfile.not(pBtnApply).hide()

                    $('html, body').animate({
                        scrollTop: collapsibleChild.offset().top
                    }, 250)
                }
            })

        const pBtnApply = $("<button>")
            .addClass("p-btn-apply")
            .attr({ type: "button" })
            .append("Apply Profile")
            .hide()
            .on("click", () => {
                // TODO: apply profile
            })

        const pBtn = $("<div>")
            .append(pBtnCancel)
            .append(pBtnAction)
            .append(pBtnApply)

        const pProfile = $("<div>")
            .addClass("collapsible")
            .append(pInput)
            .append(pBtn)

        // ---------------------------------------------------------------------
        // ---------------------------------------------------------------------

        function contentItem(text, appendTo) {
            function resetDeleteButton() {
                cBtnCancel.hide()
                cBtnDelete.removeClass("delete")
            }

            const cBtnCancel = $("<button>")
                .attr({ type: "button" })
                .append("Cancel")
                .hide()
                .on("click", () => {
                    resetDeleteButton()
                })

            const cBtnDelete = $("<button>")
                .attr({ type: "button" })
                .html("Delete")
                .on("click", () => {
                    if (cBtnDelete.hasClass("delete")) {
                        resetDeleteButton()

                        // TODO: delete item
                    } else {
                        cBtnDelete.addClass("delete")
                        cBtnCancel.show()
                    }
                })

            const cBtn = $("<div>")
                .addClass("row")
                .append(cBtnCancel)
                .append(cBtnDelete)


            $("<div>")
                .addClass("row")
                .append($("<span>").html(text))
                .append(cBtn)
                .appendTo(appendTo)
        }

        const cScope = $("<div>")
            .append($("<h3>").html("Scope"))
        for (let i = 0; i < r.length; i++) {
            const text = r[i];
            contentItem(text, cScope)
        }

        const cDescription = $("<div>")
            .append($("<h3>").html("Description"))
        for (let i = 0; i < r.length; i++) {
            const text = r[i];
            contentItem(text, cDescription)
        }

        const cBody = $("<div>")
            .append($("<h3>").html("Body"))
        for (let i = 0; i < r.length; i++) {
            const text = r[i];
            contentItem(text, cBody)
        }

        const cFooter = $("<div>")
            .append($("<h3>").html("Footer"))
        for (let i = 0; i < r.length; i++) {
            const text = r[i];
            contentItem(text, cFooter)
        }

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
                .attr({ type: "button" })
                .append("Cancel")
                .on("click", () => {
                    addProfileText = ""
                    addProfileInput.val("")
                    inlineAlert.html("")
                    btns.remove()
                })

            const btnSave = $("<button>")
                .attr({ type: "button" })
                .html("Save")
                .on("click", () => {
                    if (!safeCharactersRegex.test(addProfileText)) {
                        inlineAlert.html("Input contains invalid characters. Please use only letters, numbers, and the following symbols: . _ ( ) : @ -")
                        return
                    }

                    addProfileText = ""
                    addProfileInput.val("")
                    inlineAlert.html("")
                    btns.remove()

                    // TODO: save profile
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