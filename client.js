
var client = {
    init: function() {
        this._pageContainer = document.querySelector('.b-singlepost');

        chrome.extension.sendRequest({action: 'getOptions'}, function(response) {
            _settings.setData(response);

            var options = _settings.getOptions();

            var domains = options.workingDomains.split('\n'),
                activeDomain;

            domains.forEach(function(domain) {
                if (location.href.match(RegExp('^http:\/\/[a-z0-9]+\.' + domain.replace(/(\.|\+|\*)/g, '\\$1'), 'i'))) {
                    activeDomain = domain;
                }
            });

            if (!activeDomain) {
                return;
            }

            Object.keys(options).forEach(function(prop) {
                var method = 'init' + _utils.firstUpper(prop);
                (method in this) && this[method](options[prop], options); 
            }.bind(this));

            this.initUpdateBml(activeDomain, options);
            this.initIndex(activeDomain, options);
        }.bind(this));
    },

    initCommentsize: function(value, options) {
        if (!this._pageContainer) { return; } //we need only s1 pages with new design

        if (value !== 'm') {
            this._pageContainer.classList.add('lje-commentsize-' + value);
        }
    },

    initCommentfont: function(value, options) {
        if (!this._pageContainer) { return; } //we need only s1 pages with new design

        this._pageContainer.classList.add('lje-commentfont-' + value);
    },

    initSuppressgradient: function(value, options) {
        if (!this._pageContainer) { return; } //we need only s1 pages with new design

        if (value) {
            this._pageContainer.classList.add('lje-suppressgradient');
        }
    },

    initShowcontrols: function(value, options) {
        if (!this._pageContainer) { return; } //we need only s1 pages with new design

        if (value) {
            this._pageContainer.classList.add('lje-commenthover-visible');
        }
    },

    initShowsubjects: function(value, options) {
        if (!value) { return; }
        if (!this._pageContainer) { return; } //we need only s1 pages with new design


        this._pageContainer.classList.add('lje-commentsubject-show');

        var form =  document.getElementById('postform'),
            subject = form.subject,
            subjectval = subject.value;

        var moveSubjectField = function() {
                subject.type = 'text';
                subject.size = 55;
                subject.placeholder = chrome.i18n.getMessage('client_subject');
                subject.classList.add('b-watering-subject');

                var markup = '<div class="b-watering-subjectbox"></div>';
                    div = document.createElement('div');

                div.innerHTML = markup;
                var insertEl = div.firstChild,
                    comment = form.querySelector('.b-updateform');

                comment.parentNode.insertBefore(insertEl, comment);
                insertEl.appendChild(subject);
            },
            bindAddCommentLinks = function(container) {
                container.addEventListener('click', function(ev) {
                    var control = ev.srcElement;
                    //we set subject input value on every click, because if the form will close,
                    //this action will do no harm, and it's a correct action otherwise.
                    if (_utils.matchesSelector(control, '.b-leaf-actions-reply .b-pseudo')) {
                        var comment = _utils.closest(control, '.b-leaf'),
                            subjectNode = comment.querySelector('.b-leaf-subject'),
                            subjectHeader = subjectNode && subjectNode.innerHTML.replace(/^(Re:\s*)+/,'') || '';

                        if (subjectHeader.length > 0) {
                            subject.value = 'Re: ' + subjectHeader;
                        }
                    }
                }, false)
            };

        moveSubjectField();
        bindAddCommentLinks(this._pageContainer);
    },

    initUpdateBml: function(domain, options) {
        if (!location.href.match(RegExp('^http:\/\/[a-z0-9]+\.' + domain.replace(/(\.|\+|\*)/g, '\\$1') + '\/update\.bml', 'i'))) {
            return;
        }

        var draftChecker = function() {
                if (window.isInitDraft) {
                    var event = document.createEvent('Event');
                    event.initEvent('draftExists', true, true);
                    document.body.dispatchEvent(event);
                }
            },
            handleDraft = function() {
                document.body.removeEventListener('draftExists', handleDraft);
                injectClearButton();
            },
            injectClearButton = function() {
                var div = document.createElement('div'),
                    link = document.createElement('a');

                div.classList.add('clear-draft');
                div.appendChild(link);

                link.textContent = chrome.i18n.getMessage('client_clear_draft');
                link.href = '#';
                link.addEventListener('click', clearDraft, false);

                var node = document.querySelector('#draftstatus');

                node.parentNode.insertBefore(div, node);
                div.appendChild(node);
            },
            clearDraft = function(ev) {
                ev.preventDefault();
                if(window.confirm(chrome.i18n.getMessage('client_clear_draft'))) {
                    var req = new XMLHttpRequest();
                    req.open("POST", 'http://www.' + domain + '/tools/endpoints/draft.bml', true);
                    req.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded");
                    req.send('saveDraft=');
                    ev.target.style.opacity = 0;
                }
            };

        document.body.addEventListener('draftExists', handleDraft, false);
        var script = document.createElement('script');
        script.text = '(' + draftChecker.toString() + ')()';
        document.body.appendChild(script);
    },

    initIndex: function(domain, options) {
        var node = document.querySelector('.selfpromo-bubble-entry p:nth-child(2) b');
        if (!node) { return; }

        var price = parseInt( node.innerHTML.replace(/\s+/g, ''), 10),
            mul = 0.01;

        node.innerHTML += ' (USD $' + (mul * price) + ')';
    }

}

client.init();
