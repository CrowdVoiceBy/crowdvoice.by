Class(Tellurium.Reporter, 'Console')({
    prototype : {
        totalSpecs    : null,
        failedSpecs   : null,
        passedSpecs   : null,
        pendingSpecs  : null,

        init : function () {
            this.totalSpecs   = 0;
            this.failedSpecs  = 0;
            this.passedSpecs  = 0;
            this.pendingSpecs = 0;
        },

        run : function (suite) {
            console.log("===========================");
            console.log('Tellurium Test Results for '.bold + suite.description.bold);
            this.totalSpecs   = 0;
            this.passedSpecs  = 0;
            this.failedSpecs  = 0;
            this.pendingSpecs = 0;

            this.suite(suite);
            console.log("\n");
            console.info( 'Passed : '.green + this.passedSpecs.toString().green);
            console.warn( 'Pending: '.yellow + this.pendingSpecs.toString().yellow);
            console.error('Failed : '.red + this.failedSpecs.toString().red);
            console.info( 'Total  : '.bold + this.totalSpecs.toString().bold);
            console.log("===========================");
        },

        suite : function (suite) {
            var i;

            console.log('  '.bold.bgBlue + suite.description.bold.bgBlue);

            for (i = 0; i < suite.children.length; i += 1) {
                if (suite.children[i] instanceof Tellurium.Description) {
                    this.description(suite.children[i]);
                } else if (suite.children[i] instanceof Tellurium.Specification) {
                    this.specification(suite.children[i]);
                }
            }
        },

        description : function (description) {
            var i;
            console.log('    '.bold.bgGreen + description.description.bold.bgGreen);

            for (i = 0; i < description.children.length; i += 1) {
                if (description.children[i] instanceof Tellurium.Description) {
                    this.description(description.children[i]);
                } else if (description.children[i] instanceof Tellurium.Specification) {
                    this.specification(description.children[i]);
                }
            }

        },

        specification : function (specification) {
            var i;

            this.totalSpecs = this.totalSpecs + 1;

            if (specification.status === specification.STATUS_FAIL) {
                this.failedSpecs = this.failedSpecs + 1;
                console.log("FAIL ".red + specification.description.underline);
            } else if (specification.status === specification.STATUS_SUCCESS) {
                this.passedSpecs = this.passedSpecs + 1;
                console.log("PASS ".green + specification.description.underline);
            } else if (specification.status === specification.STATUS_PENDING) {
                this.pendingSpecs = this.pendingSpecs + 1;
                console.log("PENDING ".yellow + specification.description.underline);
            }

            console.log("Assertions:");
            for (i = 0; i < specification.assertions.length; i += 1) {
                this.assertion(specification.assertions[i]);
            }

        },

        assertion : function (assertion) {
            var not;
            if (assertion.type === Tellurium.Assertion.prototype.TYPE_FALSE) {
                not = ' not ';
            } else {
                not = ' ';
            }

            if (assertion.status === assertion.STATUS_SUCCESS) {
                console.log("  " + assertion.label + " " + assertion.actual);
                console.log("  " + assertion.label + " " + assertion.actual +
                    not + assertion.invoked + ' ' + (assertion.expected) ? assertion.expected : '');
            } else if (assertion.status === assertion.STATUS_FAIL) {
                console.log("  " + assertion.label + " " + assertion.actual +
                    not + assertion.invoked + ' ' + (assertion.expected) ? assertion.expected : '');
            }
        }
    }
});
