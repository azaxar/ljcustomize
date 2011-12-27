
var client = {
    init: function() {
        this._pageContainer = document.querySelector('.b-singlepost');

        if (!this._pageContainer) { return; } //we need only s1 pages with new design

        chrome.extension.sendRequest({action: 'getOptions'}, function(response) {
            _settings.setData(response);

            var options = _settings.getOptions();

            Object.keys(options).forEach(function(prop) {
                var method = 'init' + _utils.firstUpper(prop);
                (method in this) && this[method](options[prop], options); 
            }.bind(this));
        }.bind(this));
    },

    initCommentsize: function(value, options) {
        if (value !== 'm') {
            this._pageContainer.classList.add('lje-commentsize-' + value);
        }
    },

    initCommentfont: function(value, options) {
        this._pageContainer.classList.add('lje-commentfont-' + value);
    },

    initSuppressgradient: function(value, options) {
        if (value) {
            this._pageContainer.classList.add('lje-suppressgradient');
        }
    },

    initShowcontrols: function(value, options) {
        if (value) {
            this._pageContainer.classList.add('lje-commenthover-visible');
        }
    },

    initShowsubjects: function(value, options) {
        if (!value) { return; }

        this._pageContainer.classList.add('lje-commentsubject-show');

        var form =  document.getElementById('postform'),
            subject = form.subject,
            subjectval = subject.value;

        subject.type = 'text';
        subject.size = 55;
        subject.placeholder = chrome.i18n.getMessage('client_subject');
        subject.classList.add('b-watering-subject');

        var markup = '<div class="b-watering-subjectbox"></div>';
            div = document.createElement('div');

        div.innerHTML = markup;
        var insertEl = div.firstChild,
            comment = form.querySelector('.b-watering-comment');

        comment.parentNode.insertBefore(insertEl, comment);
        insertEl.appendChild(subject);
    }
}

client.init();
