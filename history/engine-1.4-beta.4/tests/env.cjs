"use strict";

// Preloaded by `npm test`: usage counters are off during tests so fixtures are never written to.
// Tests of the counters turn them on for their own temporary projects.
if (!process.env.ROYASCAFF_USAGE) process.env.ROYASCAFF_USAGE = "off";
// A person's look asks on the terminal (beta.4 D9); tests never wait for one. The walkthrough answers
// through a pseudo-terminal where it means to.
if (!process.env.ROYASCAFF_NO_TTY) process.env.ROYASCAFF_NO_TTY = "1";
