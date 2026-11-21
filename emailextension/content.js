// is the js file that is helps to  inject a button in gmail screen or in gui and a;so hepls to call the api
//mutation observer-it is  used to detect any changes in the dom
//like when a user goes to compose .that is a change and in thsi compose we need to inject our button
//Scenario

//Imagine you have an online exam portal.
//On the question page, when a student submits an answer, the backend replaces the form with a message saying "Your answer is submitted!".

//You want to:

/**Detect when this change happens.

Automatically stop the exam timer when the submission message appears.

We can use MutationObserver for this*/
    console.log("Email Writer Extension - Content Script Loaded");

    function createAIButton() {
        const button = document.createElement('div');
        button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button';
        button.style.marginRight = '8px';
        button.innerHTML = 'AI Reply';
        button.setAttribute('role', 'button');
        button.setAttribute('data-tooltip', 'Generate AI Reply');
        return button;
    }
//getting the emial content---------------
   /* function getEmailContent() {
        const selectors = [
            '.h7',               // Subject
            '.a3s.aiL',          // Email body
            '.gmail_quote',      // Quoted reply
            '[role="presentation"]'
        ];
        
        for (const selector of selectors) {
            const content = document.querySelector(selector);
            if (content) {
                console.log("Actual la mail la erundha emial content",content);
                return content.innerText.trim();
            }
        }
        return '';
    }*/
   function getEmailContent() {
    // Try to get the currently opened email's body container
    const emailBodyElement = document.querySelector(".a3s.aiL");

    if (!emailBodyElement) {
        console.warn("Email body container not found!");
        return "";
    }

    // Gmail sometimes splits the message into multiple nested elements,
    // including <div>, <span>, and even invisible containers.
    // This collects all visible text.
    let textContent = "";
    emailBodyElement.querySelectorAll("*").forEach(node => {
        // Skip quoted text blocks and hidden nodes
        const isQuoted = node.classList.contains("gmail_quote");
        const isHidden = window.getComputedStyle(node).display === "none" || window.getComputedStyle(node).visibility === "hidden";
        if (!isQuoted && !isHidden && node.childElementCount === 0) {
            textContent += node.textContent.trim() + " ";
        }
    });

    // If nothing found above, fall back to the full innerText
    if (!textContent.trim()) {
        textContent = emailBodyElement.innerText || "";
    }

    textContent = textContent.trim();
    console.log("Extracted email content:", textContent);
    return textContent || "";
}



//hat it does → This declares a function named findComposeToolbar that, when called, will search for the toolbar area (where Gmail puts buttons like Send, Attach, Formatting, etc.) in the currently open compose or reply window.
    function findComposeToolbar() {
       /* Purpose → This creates an array of possible CSS selectors to identify Gmail’s toolbar element.

.btC → This is a Gmail-specific CSS class often used for the toolbar when you’re composing a new email in its own window.

.aDh → This is another Gmail-specific CSS class, typically used for the toolbar when you’re in a reply or inline reply mode.

[role="toolbar"] → This is a generic ARIA attribute selector for any element with role="toolbar". This is a more universal fallback in case Gmail changes its class names but still keeps accessibility roles.

.gU.Up → This matches a toolbar with two CSS classes gU and Up (common in some Gmail layouts).*/
        const selectors = [
            '.btC',              // Main compose toolbar
            '.aDh',              // Reply toolbar when we are reply a toolbar comes now,that comes from this class only
            '[role="toolbar"]',  // Generic toolbar role
            '.gU.Up'             // Another Gmail toolbar variant
        ];

        /*Alright — let’s walk through exactly what happens when you’re in a reply toolbar step-by-step with your current function.

1. You open Gmail and click “Reply”

Gmail loads an inline reply box under the email.

The toolbar for this reply is in the DOM and looks something like:

<div class="aDh">
    <!-- Send button, attach icon, formatting, emoji -->
</div>

2. Your function runs
function findComposeToolbar() {
    const selectors = [
        '.btC',              // New compose toolbar
        '.aDh',              // Reply toolbar
        '[role="toolbar"]',  // Generic toolbar
        '.gU.Up'             // Another Gmail toolbar
    ];


You’ve got 4 possible selectors here.

3. The loop starts
for (const selector of selectors) {


First, selector = ".btC"

const toolbar = document.querySelector(".btC");


Since we are in reply mode, there’s no .btC in the DOM → toolbar = null.
So, the if (toolbar) check fails and it goes to the next selector.

Second, selector = ".aDh"

const toolbar = document.querySelector(".aDh");


This time, .aDh exists in the DOM because that’s the reply toolbar.
Example:

<div class="aDh">
    ... buttons ...
</div>


document.querySelector(".aDh") returns that <div>.

4. Toolbar found → returns
if (toolbar) {
    return toolbar;
}


Since .aDh exists, it immediately returns this toolbar element to the calling code.
That’s the exact DOM node where your code injects the AI Reply button.

5. Other selectors never get checked

The loop stops early because it found a match.
[role="toolbar"] and .gU.Up don’t get checked at all.*/ 
        for (const selector of selectors) {
            const toolbar = document.querySelector(selector);
            if (toolbar) {
                return toolbar;
            }
        }
        return null;
    }
// Here we are injecting the button
    function injectButton() {
      //  first checking  whether any button already exits '.ai-reply-button-this iss the name of the div in which the button is assumed to be created'
        if (document.querySelector('.ai-reply-button')) return; // Prevent duplicates
// we are going to inject the button in the tool bar,tool bar means the place where the send button is present so we are finduung the toolbar
        const toolbar = findComposeToolbar();
        if (!toolbar) {
            console.log("Toolbar not found");
            return;
        }

        console.log("Toolbar found, creating AI button");//just for debuggging
        const button = createAIButton();
// here we call backend api
/*What is addEventListener?

addEventListener is a JavaScript function that lets you tell the browser:

"Hey, when this thing happens to this element, run this code."

The element in your case is button (the AI Reply button you created earlier).

The event is "click" — meaning, when the user clicks on it.

The code you give it is a function (in your case, an async arrow function).
What is async () => { ... }?

This is an arrow function in JavaScript.

async means this function can use the await keyword inside it to wait for things like API calls before moving to the next line.

() => { ... } is just a shorthand for:

function() {
    // your code
}*/
        button.addEventListener('click', async () => {
            try {
                button.innerHTML = 'Generating...';
                button.style.opacity = '0.6';
                button.disabled = true;

                const emailContent = getEmailContent();
                console.log("send panna email content",emailContent);
                

             

                const response = await fetch('http://localhost:8080/api/email/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        emaili: emailContent,
                        tone: "professional"
                    })
                });

                if (!response.ok) throw new Error('API Request Failed');

                const generatedReply = await response.text();
                const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

                if (composeBox) {
                    composeBox.focus();
                    document.execCommand('insertText', false, generatedReply);
                } else {
                    console.error('Compose box not found');
                }
            } catch (error) {
                console.error(error);
                alert('Failed to generate reply');
            } finally {
                button.innerHTML = 'AI Reply';
                button.style.opacity = '1';
                button.disabled = false;
            }
        });

        toolbar.insertBefore(button, toolbar.firstChild);
    }

/*What this block does (in plain English)

Watches the Gmail page for when a compose/reply UI appears.

When it detects one, it waits 500ms (to let Gmail finish rendering) and then injects your AI Reply button.

As a safety net, a 1.5s interval also checks if a compose UI exists and your button isn’t there yet; if so, it injects it. */
    // ---- MutationObserver to detect reply box opening ----
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            const addedNodes = Array.from(mutation.addedNodes);
            const hasComposeElements = addedNodes.some(node =>
                node.nodeType === Node.ELEMENT_NODE &&
                (node.matches('.aDh, .btC, [role="dialog"]') ||
                node.querySelector('.aDh, .btC, [role="dialog"]'))
            );

            if (hasComposeElements) {
                console.log("Compose Window Detected");
                setTimeout(injectButton, 500);
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // ---- Fallback interval in case observer misses it ----
    setInterval(() => {
        if (document.querySelector('.aDh, .btC, [role="dialog"]') &&
            !document.querySelector('.ai-reply-button')) {
            injectButton();
        }
    }, 1500);
