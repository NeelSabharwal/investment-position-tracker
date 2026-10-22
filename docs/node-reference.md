# Node description reference

326 descriptions across 392 nodes in the cleaned A–J drafts. The 66 retained helper/fixture/sticky nodes without notes are omitted from this short reference. Published graphs may contain additional older branches.

For interactive search, download and open [node-reference.html](node-reference.html). This Markdown copy also supports browser Find (Ctrl+F).

| Workflow | Nodes | Descriptions |
| --- | ---: | ---: |
| A | 80 | 73 |
| B | 23 | 13 |
| C | 15 | 11 |
| D | 92 | 67 |
| E | 57 | 52 |
| F | 29 | 20 |
| G | 16 | 15 |
| H | 17 | 17 |
| I | 54 | 49 |
| J | 9 | 9 |

## IPT A - Email Processor - LIVE GUARDED POSITIONS

[Open workflow A](https://neelsabh.app.n8n.cloud/workflow/YEgEdoioirlXidpK)

### Manual - fictional tests

**Type:** `manualTrigger`

Operator-only entry for tests or inspection. It does not run on a timer or receive unsolicited messages.

### Run Phase 3 checks

**Type:** `code`

Run preserved deterministic assertions for this named behavior. Inspect passed/checks and mode; a mock test does not prove a live API integration.

### Validate fictional envelope

**Type:** `code`

Deterministic processing step: Validate fictional envelope. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Email intake or recovery

**Type:** `executeWorkflowTrigger`

Receive data from an allowed parent workflow. This reusable entry has no public HTTP endpoint; caller policy is enforced at workflow level.

### Read intake and source state

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Prepare durable intake

**Type:** `code`

Construct the next request, checkpoint or private response from validated upstream context. This Code node prepares data; the following integration node performs any external write.

### Intake decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Return suppressed result

**Type:** `code`

Return the classified result for this branch. The output identifies a completed, suppressed, no-op or review outcome; it must not be confused with an unconditional successful trade.

### Save intake checkpoint

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read back intake checkpoint

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify intake and choose dependency

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Dependency route

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Analyzer input

**Type:** `code`

Deterministic processing step: Analyzer input. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Position Manager input

**Type:** `code`

Deterministic processing step: Position Manager input. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Call B - AI Analyzer

**Type:** `executeWorkflow`

Invoke workflow B with the current item. Wait for the child outcome before continuing.

### Classify analyzer outcome

**Type:** `code`

Deterministic processing step: Classify analyzer outcome. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Save frozen analysis

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read back frozen analysis

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify analysis and route

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Analysis decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Call C - Position Manager

**Type:** `executeWorkflow`

Invoke workflow C with the current item. Wait for the child outcome before continuing.

### Classify manager outcome

**Type:** `code`

Deterministic processing step: Classify manager outcome. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Save final intake outcome

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read back final outcome

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify final outcome

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Dick Capital Gmail - every 5 minutes

**Type:** `gmailTrigger`

Poll matching Gmail notifications with the configured project credential and search filters. Emit message items for the intake path.

### Read A writer ownership

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Require A writer ownership

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Normalize authorized Dick email

**Type:** `code`

Build the trusted Dick Capital envelope from the Gmail notification. Preserve message and chat-post identity, source context, evidence text and the source-specific action convention.

### Read live trade intake ledger

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Prepare live intake checkpoint

**Type:** `code`

Look up the durable intake identity and decide whether to create a checkpoint, resume an unfinished job, or return a completed duplicate. Preserve the content fingerprint.

### Append live intake checkpoint

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify live checkpoint append

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Live analyzer input

**Type:** `code`

Build the approved input contract for B from the saved live intake. Keep the source, dataset, portfolio catalog and normalization provenance attached.

### Call B - live review extraction

**Type:** `executeWorkflow`

Invoke workflow B with the current item. Wait for the child outcome before continuing.

### Finalize live review record

**Type:** `code`

Translate the analyzer classification into a durable intake status. Uncertain or invalid events are held for review; validation is required before a manager call.

### Save live review outcome

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read back live review row

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify live review write

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Send private live review alert

**Type:** `httpRequest`

Send the prepared POST request to Discord. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Prepare live alert receipt

**Type:** `code`

Construct the next request, checkpoint or private response from validated upstream context. This Code node prepares data; the following integration node performs any external write.

### Save live alert receipt

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Route real recovery request

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Live request context

**Type:** `code`

Deterministic processing step: Live request context. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Intake append needed

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Live work context

**Type:** `code`

Deterministic processing step: Live work context. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Save live attempt checkpoint

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read live attempt checkpoint

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify live attempt checkpoint

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Frozen analysis route

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Reuse frozen live analysis

**Type:** `code`

Deterministic processing step: Reuse frozen live analysis. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Ready for guarded manager

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Prepare automatic writer claim

**Type:** `code`

Construct the next request, checkpoint or private response from validated upstream context. This Code node prepares data; the following integration node performs any external write.

### Claim automatic writer

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read automatic writer

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify automatic writer

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Automatic writer decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Live manager request

**Type:** `code`

Construct C’s real-event request with the saved validated analysis and exact creator writer ownership. This is the authorization boundary for position mutation.

### Apply real positions through C

**Type:** `executeWorkflow`

Invoke workflow C with the current item. Wait for the child outcome before continuing.

### Finish automatic position attempt

**Type:** `code`

Classify C’s verified result and prepare a durable intake update. A failed or ambiguous child result cannot be presented as an accepted position update.

### Save automatic position outcome

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read automatic position outcome

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify automatic position outcome

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Release required

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Release automatic writer

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify automatic writer release

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Live notification context

**Type:** `code`

Deterministic processing step: Live notification context. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Checkpoint notification attempt

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Ready private trade notification

**Type:** `code`

Deterministic processing step: Ready private trade notification. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Wrap each authorized Gmail message

**Type:** `code`

Wrap each received notification separately so a trigger batch can dispatch each message rather than silently taking only the first.

### Dispatch each Gmail message

**Type:** `executeWorkflow`

Invoke workflow A with the current item. Dispatch without waiting; durable child checkpoints track the result.

### Unwrap one Gmail message

**Type:** `code`

Deterministic processing step: Unwrap one Gmail message. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Read original Dick Gmail message

**Type:** `httpRequest`

Fetch the exact Gmail message ID with format full using the project Gmail credential. This normalizes simplified trigger headers to the original Gmail API shape. Three bounded HTTP attempts handle temporary transport failures before downstream normalization and durable deduplication.


## IPT B - AI Analyzer - LIVE SOURCE RULES

[Open workflow B](https://neelsabh.app.n8n.cloud/workflow/TOCdQCy0xx0WMLLT)

### Manual - deterministic tests

**Type:** `manualTrigger`

Operator-only entry for tests or inspection. It does not run on a timer or receive unsolicited messages.

### Run 50 fictional checks

**Type:** `code`

Run preserved deterministic assertions for this named behavior. Inspect passed/checks and mode; a mock test does not prove a live API integration.

### When Executed by Another Workflow

**Type:** `executeWorkflowTrigger`

Receive data from an allowed parent workflow. This reusable entry has no public HTTP endpoint; caller policy is enforced at workflow level.

### Privacy and input gate

**Type:** `code`

Check the caller input and content policy, normalize permitted source text, and reject input that lacks the required source/fixture/approval context.

### Deterministic validation

**Type:** `code`

Validate the AI proposal against the exact extraction schema and source evidence. Build trusted event identities and determine whether C is eligible to receive the result.

### Build official Gemini request

**Type:** `code`

Construct the next request, checkpoint or private response from validated upstream context. This Code node prepares data; the following integration node performs any external write.

### Gemini LLM Chain - structured extraction

**Type:** `chainLlm`

Submit the prepared extraction or review prompt to the connected Gemini model node. The resulting text still requires deterministic validation.

### Gemini 3.5 Flash-Lite - existing credential

**Type:** `lmChatGoogleGemini`

Provide the configured Gemini model and credential to the connected AI chains. This is an AI language-model resource connection, not a normal main-data branch.

### One review pass needed

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Return analyzer decision

**Type:** `code`

Return the classified result for this branch. The output identifies a completed, suppressed, no-op or review outcome; it must not be confused with an unconditional successful trade.

### Prepare one evidence review

**Type:** `code`

Prepare one bounded second model pass for unresolved extraction. Keep the original source and uncertainty; this is not permission to invent missing transactions.

### Gemini - one evidence review

**Type:** `chainLlm`

Submit the prepared extraction or review prompt to the connected Gemini model node. The resulting text still requires deterministic validation.

### Validate reviewed extraction

**Type:** `code`

Validate the second-pass proposal with the same deterministic evidence and schema rules. Unresolved essential facts remain review rather than becoming accepted data.


## Isolate operational failure logs from portfolio readers

[Open workflow C](https://neelsabh.app.n8n.cloud/workflow/6AbLgQwiR3KzKJ83)

### Manual - isolated recovery tests

**Type:** `manualTrigger`

Operator-only entry for tests or inspection. It does not run on a timer or receive unsolicited messages.

### Run 50 fixture and recovery checks

**Type:** `code`

Run preserved deterministic assertions for this named behavior. Inspect passed/checks and mode; a mock test does not prove a live API integration.

### When Executed by Another Workflow

**Type:** `executeWorkflowTrigger`

Receive data from an allowed parent workflow. This reusable entry has no public HTTP endpoint; caller policy is enforced at workflow level.

### Validate manager request

**Type:** `code`

Validate operation mode, event/source/dataset identity and the saved analysis before the manager reads or changes state.

### Read four-tab snapshot

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Reconcile and plan one write

**Type:** `code`

Compare the requested operation with the actual four-tab snapshot. Reuse accepted history, verify hashes and baseline provenance, calculate the projection, and plan one safe next write or a final outcome.

### Finished

**Type:** `if`

Evaluate the completion condition. One branch returns the verified result; the other continues the planned write/read reconciliation loop.

### Return verified outcome

**Type:** `code`

Return only a reconciled manager outcome after the expected history, projection and operation checkpoint agree. This result is consumed by the caller.

### Write one reconciled range RAW

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read C writer ownership

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Require C writer ownership

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.


## IPT D - Private Discord Command Handler

[Open workflow D](https://neelsabh.app.n8n.cloud/workflow/6oUxCXrJa2EiqgEn)

### Manual - command tests

**Type:** `manualTrigger`

Operator-only entry for tests or inspection. It does not run on a timer or receive unsolicited messages.

### Run signature and command checks

**Type:** `code`

Run preserved deterministic assertions for this named behavior. Inspect passed/checks and mode; a mock test does not prove a live API integration.

### Discord interactions - private demo

**Type:** `webhook`

Receive Discord HTTP interactions while preserving original request bytes. A later Code node verifies the signature and authorization before private work.

### Verify live signature - deployment gate

**Type:** `code`

Read the original binary request body and verify timestamped Ed25519 signature. Validate application, guild, user and registered command ID before creating an ephemeral deferred acknowledgement.

### Acknowledge interaction

**Type:** `respondToWebhook`

Send the initial Discord response immediately using the verified acknowledgement. Authorized commands defer with an ephemeral flag before slow processing.

### Allow approved private reads

**Type:** `code`

Enforce the private delivery gate after acknowledgement. Recheck command authorization and token lifetime before dispatching a private database operation.

### Route private command

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Read personal portfolio sheet

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Build private personal positions reply

**Type:** `code`

Read the personal projection and import log, enforce exact headers, select active USD holdings and format quantities, average costs, stored prices and tracked P/L. Include coverage and import timestamps.

### Send private personal positions reply

**Type:** `httpRequest`

Send the prepared PATCH request to the configured external endpoint. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify private personal positions reply

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Read latest generated briefing

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Build private market brief reply

**Type:** `code`

Compose a private recent briefing from stored real article and brief rows, with source provenance and author-opinion labels. It does not request stock quotes.

### Send private market brief reply

**Type:** `httpRequest`

Send the prepared PATCH request to the configured external endpoint. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify private market brief reply

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Read creator positions for private reply

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Build private creator positions reply

**Type:** `code`

Select only real Dick Capital holdings, optionally filter Trading or Long-Term Portfolio, paginate eight holdings per page, and show reported opening/endorsement references.

### Send private creator positions reply

**Type:** `httpRequest`

Send the prepared PATCH request to the configured external endpoint. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify private creator positions reply

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Read personal portfolio for update

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Build personal transaction update

**Type:** `code`

Validate the personal buy/sell request and history, calculate weighted-average cost and supported realized/unrealized results, and plan an idempotent transaction/projection update.

### Personal transaction write needed

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Write personal transaction

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read back personal transaction

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify personal transaction

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Refresh sell ticker dropdown

**Type:** `httpRequest`

Patch the server-specific sell command choices from the eligible current personal holdings after a verified transaction.

### Verify refreshed sell dropdown

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Send private personal transaction reply

**Type:** `httpRequest`

Send the prepared PATCH request to the configured external endpoint. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify private personal transaction reply

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Personal transaction math regression

**Type:** `code`

Run preserved deterministic assertions for this named behavior. Inspect passed/checks and mode; a mock test does not prove a live API integration.

### Read recent creator news

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Build private creator news reply

**Type:** `code`

Filter stored real news by the selected creator, enforce freshness/limits, and build the private reply. No creator holdings are mutated.

### Send private creator news reply

**Type:** `httpRequest`

Send the prepared PATCH request to the configured external endpoint. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify private creator news reply

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Manual live review preview fixture

**Type:** `code`

Retained manual fixture or maintenance selector. Review its explicit enable flag and execution-mode guard; graph connectivity does not mean this selector currently emits an item.

### Read live review state

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Build private live review reply

**Type:** `code`

Construct the next request, checkpoint or private response from validated upstream context. This Code node prepares data; the following integration node performs any external write.

### Live review preview mode

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Send private live review reply

**Type:** `httpRequest`

Send the prepared PATCH request to the configured external endpoint. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify private live review reply

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Verify live review preview regression

**Type:** `code`

Run preserved deterministic assertions for this named behavior. Inspect passed/checks and mode; a mock test does not prove a live API integration.

### Build private Dick history reply

**Type:** `code`

Select real Dick Capital accepted events for the exact ticker. Include baseline presence separately so a baseline is never labelled as an OPEN trade.

### Read real Dick history

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Send private Dick history reply

**Type:** `httpRequest`

Send the prepared PATCH request to the configured external endpoint. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify private Dick history reply

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Prepare personal writer claim

**Type:** `code`

Construct the next request, checkpoint or private response from validated upstream context. This Code node prepares data; the following integration node performs any external write.

### Claim personal writer

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read personal writer ownership

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify personal writer ownership

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Personal writer decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Private personal busy reply

**Type:** `code`

Deterministic processing step: Private personal busy reply. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Prepare personal owner release

**Type:** `code`

Construct the next request, checkpoint or private response from validated upstream context. This Code node prepares data; the following integration node performs any external write.

### Release personal writer

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify personal owner release

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Personal private response context

**Type:** `code`

Deterministic processing step: Personal private response context. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Personal write verified

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Find recent Dick notifications

**Type:** `httpRequest`

Read Gmail data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Choose one unprocessed Dick notification

**Type:** `code`

Compare the bounded recent Gmail search with the live ledger; select one eligible unprocessed message or return a clear no-work result.

### Manual analysis work available

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Read one manual Dick notification

**Type:** `httpRequest`

Read Gmail data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Send manual notification through A

**Type:** `code`

Deterministic processing step: Send manual notification through A. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Run A for manual notification

**Type:** `executeWorkflow`

Invoke workflow A with the current item. Wait for the child outcome before continuing.

### Read manual analysis outcome

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Build manual analysis completion reply

**Type:** `code`

Report the durable result of the single selected analysis. Do not imply C was called or positions changed when the command found no eligible work.

### Private analysis reply context

**Type:** `code`

Deterministic processing step: Private analysis reply context. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Update current command labels — manual maintenance

**Type:** `code`

Deterministic processing step: Update current command labels — manual maintenance. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Inspect Macro permissions — manual only

**Type:** `code`

Deterministic processing step: Inspect Macro permissions — manual only. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.


## IPT E - Error and Recovery - LIVE BOUNDED

[Open workflow E](https://neelsabh.app.n8n.cloud/workflow/dVNGCbyQwSKhrfee)

### Manual - recovery tests

**Type:** `manualTrigger`

Operator-only entry for tests or inspection. It does not run on a timer or receive unsolicited messages.

### Run Phase 3 recovery checks

**Type:** `code`

Run preserved deterministic assertions for this named behavior. Inspect passed/checks and mode; a mock test does not prove a live API integration.

### Recovery configuration

**Type:** `code`

Deterministic processing step: Recovery configuration. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Recovery request

**Type:** `executeWorkflowTrigger`

Receive data from an allowed parent workflow. This reusable entry has no public HTTP endpoint; caller policy is enforced at workflow level.

### Read durable recovery state

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Select recovery or record failure

**Type:** `code`

Deterministic processing step: Select recovery or record failure. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Recovery decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Return recovery report

**Type:** `code`

Return the classified result for this branch. The output identifies a completed, suppressed, no-op or review outcome; it must not be confused with an unconditional successful trade.

### Resume selected fictional input

**Type:** `code`

Deterministic processing step: Resume selected fictional input. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Save sanitized failure record

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Resume A - one operation

**Type:** `executeWorkflow`

Invoke workflow A with the current item. Wait for the child outcome before continuing.

### Recovery outcome and review report

**Type:** `code`

Deterministic processing step: Recovery outcome and review report. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Read back failure record

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify failure record

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Automatic failure event

**Type:** `errorTrigger`

Receive automatic n8n error events from workflows that name E as their error workflow. Manual test errors may not invoke this production error path.

### Claim E writer metadata

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read E writer ownership

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify E writer ownership

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### E ownership decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Read recovery outcome

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Continue after checkpoint

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Prepare E owner release

**Type:** `code`

Construct the next request, checkpoint or private response from validated upstream context. This Code node prepares data; the following integration node performs any external write.

### Release E writer metadata

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify E owner release

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Recovery schedule - every 5 minutes

**Type:** `scheduleTrigger`

Start the connected polling/recovery branch at its saved interval. This is approximately scheduled polling, not a push guarantee.

### Prepare baseline recovery request

**Type:** `code`

Construct the next request, checkpoint or private response from validated upstream context. This Code node prepares data; the following integration node performs any external write.

### Resume C - baseline recovery

**Type:** `executeWorkflow`

Invoke workflow C with the current item. Wait for the child outcome before continuing.

### Read baseline recovery result

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify baseline recovery result

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Sanitized live failure context

**Type:** `code`

Accept only recognized workflow error events. Preserve workflow/execution identifiers and failed-node context while omitting raw input and secrets from the alert record.

### Read failed execution writer

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Plan proven failed-owner release

**Type:** `code`

Compare the failed execution with the exact creator writer metadata owner. Prepare a conditional release only for a proven match, never for a merely old lock.

### Failed owner release needed

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Release proven failed owner

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify failed-owner release

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Read existing failure log

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Prepare one sanitized failure

**Type:** `code`

Construct the next request, checkpoint or private response from validated upstream context. This Code node prepares data; the following integration node performs any external write.

### Append sanitized live failure

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify failure append before alert

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Send private technical failure alert

**Type:** `httpRequest`

Send the prepared POST request to Discord. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read live retry queue

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Select one bounded live retry

**Type:** `code`

Select one eligible unfinished real Dick intake from the durable ledger and enforce the live retry limit. Exhausted cases become review/blocked rather than an endless loop.

### Live recovery decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Mark exhausted live retry

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Resume one live A checkpoint

**Type:** `executeWorkflow`

Invoke workflow A with the current item. Wait for the child outcome before continuing.

### Select durable delivery recovery

**Type:** `code`

Deterministic processing step: Select durable delivery recovery. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Resume one durable delivery

**Type:** `executeWorkflow`

Invoke workflow I with the current item. Wait for the child outcome before continuing.

### Select failed delivery owner

**Type:** `code`

Deterministic processing step: Select failed delivery owner. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Read failed delivery locks

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Plan exact failed delivery release

**Type:** `code`

Search delivery metadata claims and select only claims owned by the exact failed I execution. Build conditional deletion requests preserving unrelated owners.

### Release only failed delivery owner

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify failed delivery owner release

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.


## IPT F - Market Intelligence - LIVE PRIVATE

[Open workflow F](https://neelsabh.app.n8n.cloud/workflow/jriq2lXH1z6OncZ4)

### Manual - fictional market intelligence test

**Type:** `manualTrigger`

Operator-only entry for tests or inspection. It does not run on a timer or receive unsolicited messages.

### Authorized fictional article fixtures

**Type:** `code`

Retained manual fixture or maintenance selector. Review its explicit enable flag and execution-mode guard; graph connectivity does not mean this selector currently emits an item.

### Approved newsletter Gmail trigger

**Type:** `gmailTrigger`

Poll matching Gmail notifications with the configured project credential and search filters. Emit message items for the intake path.

### Normalize approved newsletter email

**Type:** `code`

Require the original Gmail full-message shape, exact allowed sender and authentication evidence. Decode MIME text, remove markup, preserve identity and hash, and exclude unsubstantive/promotional notifications.

### Read news source and dedup state

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Authorize and deduplicate real news

**Type:** `code`

Check enabled, content-authorized source configuration and exact schemas. New content goes to Gemini; an existing validated brief without delivery resumes; an already delivered article is skipped.

### Real news decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Return news no-op

**Type:** `code`

Return the classified result for this branch. The output identifies a completed, suppressed, no-op or review outcome; it must not be confused with an unconditional successful trade.

### Build grounded real-news request

**Type:** `code`

Ask the existing Gemini model for structured facts, opinions, literal evidence, tickers and limitations using only the email. Explicit trade language is a news flag, not a portfolio write.

### Gemini 3.5 Flash-Lite - real news

**Type:** `httpRequest`

Send the prepared POST request to Gemini. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Validate grounded brief and prepare rows

**Type:** `code`

Validate exact fields, evidence substrings, literal supported tickers and limits. Construct article, validated brief and completion rows in one atomic Sheets batch request.

### Append real article metadata

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read back stored real news

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify stored real news

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Build creator-news message

**Type:** `code`

After article/brief read-back succeeds, return a NEWS_PAYLOAD_READY object to I. This node now prepares delivery; it does not directly post to Discord.

### Dispatch each newsletter message

**Type:** `executeWorkflow`

Invoke workflow I with the current item. Dispatch without waiting; durable child checkpoints track the result.

### Newsletter worker input

**Type:** `executeWorkflowTrigger`

Receive data from an allowed parent workflow. This reusable entry has no public HTTP endpoint; caller policy is enforced at workflow level.

### Choose controlled newsletter verification

**Type:** `code`

Deterministic processing step: Choose controlled newsletter verification. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Return saved brief delivery payload

**Type:** `code`

Use a previously persisted VALIDATED brief to reconstruct the same outbound content. This resume path avoids another Gemini call.

### Queue newsletter message identifiers

**Type:** `code`

Reduce a Gmail trigger item to a validated Gmail message ID and newsletter job mode. I fetches the original message, avoiding simplified-header shape differences.


## IPT G - Watcher Guru Relay - LIVE PRIVATE

[Open workflow G](https://neelsabh.app.n8n.cloud/workflow/Jp6YtSY1fYUgOBRA)

### Manual - real source probe

**Type:** `manualTrigger`

Operator-only entry for tests or inspection. It does not run on a timer or receive unsolicited messages.

### Fetch Watcher Guru public feed

**Type:** `httpRequest`

Fetch the public Telegram channel preview. Return the page to the parser, which extracts visible posts and stable post identifiers.

### Parse real Telegram posts

**Type:** `code`

Extract stable post identifiers, visible text, dates and source URLs from the public channel page. Compute content fingerprints without asking an AI to rewrite the text.

### Every 5 minutes

**Type:** `scheduleTrigger`

Start the connected polling/recovery branch at its saved interval. This is approximately scheduled polling, not a push guarantee.

### Read Watcher Guru relay receipts

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Select unseen real posts

**Type:** `code`

Compare visible real posts with durable completed relay receipts and choose unseen eligible posts. Finite source-window and edit limitations still apply.

### New post decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Return no new posts

**Type:** `code`

Return the classified result for this branch. The output identifies a completed, suppressed, no-op or review outcome; it must not be confused with an unconditional successful trade.

### Build exact Discord message

**Type:** `code`

Preserve the parsed source text. H uses a full-text attachment when the post exceeds Discord message limits; G has its existing size guard.

### Prepare durable relay receipt

**Type:** `code`

Verify Discord’s confirmed content/channel and attachment metadata against the original post before preparing the source-specific receipt.

### Append Watcher Guru receipt

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify Watcher Guru relay

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Prepare durable relay job

**Type:** `code`

Map the original relay message key, channel, text and optional full-text attachment to I’s stable delivery request.

### Deliver through durable queue

**Type:** `executeWorkflow`

Invoke workflow I with the current item. Wait for the child outcome before continuing.

### Use confirmed durable receipt

**Type:** `code`

Only COMPLETE queue results with a verified Discord message ID reach the existing relay receipt writer. Preserve n8n item pairing for each source post.


## Remove obsolete disconnected development branches

[Open workflow H](https://neelsabh.app.n8n.cloud/workflow/wx6SMGWZplbmATaZ)

### Manual - real source probe

**Type:** `manualTrigger`

Operator-only entry for tests or inspection. It does not run on a timer or receive unsolicited messages.

### Fetch New Rules public feed

**Type:** `httpRequest`

Fetch the public Telegram channel preview. Return the page to the parser, which extracts visible posts and stable post identifiers.

### Parse real Telegram posts

**Type:** `code`

Extract stable post identifiers, visible text, dates and source URLs from the public channel page. Compute content fingerprints without asking an AI to rewrite the text.

### Read New Rules relay receipts

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Select unseen real posts

**Type:** `code`

Compare visible real posts with durable completed relay receipts and choose unseen eligible posts. Finite source-window and edit limitations still apply.

### New post decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Return no new posts

**Type:** `code`

Return the classified result for this branch. The output identifies a completed, suppressed, no-op or review outcome; it must not be confused with an unconditional successful trade.

### Relay posts one at a time

**Type:** `splitInBatches`

Process the selected relay posts in a controlled loop. The done branch reports completion; the loop branch returns after each verified receipt.

### Build exact Discord message

**Type:** `code`

Preserve the parsed source text. H uses a full-text attachment when the post exceeds Discord message limits; G has its existing size guard.

### Prepare durable relay receipt

**Type:** `code`

Verify Discord’s confirmed content/channel and attachment metadata against the original post before preparing the source-specific receipt.

### Append New Rules receipt

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Verify New Rules relay

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Every 5 minutes

**Type:** `scheduleTrigger`

Start the connected polling/recovery branch at its saved interval. This is approximately scheduled polling, not a push guarantee.

### Finish Macro poll

**Type:** `code`

Return the classified result for this branch. The output identifies a completed, suppressed, no-op or review outcome; it must not be confused with an unconditional successful trade.

### Prepare durable relay job

**Type:** `code`

Map the original relay message key, channel, text and optional full-text attachment to I’s stable delivery request.

### Deliver through durable queue

**Type:** `executeWorkflow`

Invoke workflow I with the current item. Wait for the child outcome before continuing.

### Use confirmed durable receipt

**Type:** `code`

Only COMPLETE queue results with a verified Discord message ID reach the existing relay receipt writer. Preserve n8n item pairing for each source post.


## Restore safe manual defaults after verified recovery

[Open workflow I](https://neelsabh.app.n8n.cloud/workflow/yriiOojcRgN2BhCM)

### Delivery job input

**Type:** `executeWorkflowTrigger`

Receive data from an allowed parent workflow. This reusable entry has no public HTTP endpoint; caller policy is enforced at workflow level.

### Validate delivery request

**Type:** `code`

Deterministic processing step: Validate delivery request. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Manual - operator controls

**Type:** `manualTrigger`

Operator-only entry for tests or inspection. It does not run on a timer or receive unsolicited messages.

### Choose operator action

**Type:** `code`

Default to the read-only channel audit. The internal manual failure selector is OFF after engineering verification; J is the presentation entry point.

### Read durable delivery queue

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Resolve stable delivery job

**Type:** `code`

Read the queue, select one due job or derive its stable identity, detect duplicate/conflicting records, and prepare a unique per-job metadata claim.

### Delivery job decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Return delivery no-op

**Type:** `code`

Return the classified result for this branch. The output identifies a completed, suppressed, no-op or review outcome; it must not be confused with an unconditional successful trade.

### Claim delivery writer

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read delivery writer ownership

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify delivery writer ownership

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Delivery ownership decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Return in-progress delivery

**Type:** `code`

Return the classified result for this branch. The output identifies a completed, suppressed, no-op or review outcome; it must not be confused with an unconditional successful trade.

### Read queue under owned lock

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Refresh locked delivery job

**Type:** `code`

Reread the job after acquiring the claim. This closes the stale-read race between a preliminary lookup and ownership; completed/not-due work is released without another attempt.

### Locked job still due

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Prepare owner-only delivery release

**Type:** `code`

Prepare conditional metadata deletion that includes the exact metadata ID, key and owner value. Another execution’s claim cannot be released by this request.

### Prepare attempt checkpoint

**Type:** `code`

Increment the durable attempt count, preserve the phase and due time, and stop at the bounded retry limit. Reconciliation is distinguished from a new send.

### Save attempt checkpoint

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read attempt checkpoint

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify and route attempt

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Attempt phase

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Prepare final delivery record

**Type:** `code`

Construct the next request, checkpoint or private response from validated upstream context. This Code node prepares data; the following integration node performs any external write.

### Read original newsletter for retry

**Type:** `httpRequest`

Read Gmail data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Prepare safe Discord attempt

**Type:** `code`

For the fictional demonstration only, simulate the first pre-send failure. Otherwise persist IN_FLIGHT and a send-start timestamp before the external POST.

### Find prior Discord delivery

**Type:** `httpRequest`

Read Discord data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Normalize newsletter fetch outcome

**Type:** `code`

Deterministic processing step: Normalize newsletter fetch outcome. Uses the connected input/context to prepare the next branch result; inspect this node's code for its exact rules.

### Newsletter fetch decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Classify newsletter preparation outcome

**Type:** `code`

Freeze a valid F payload, complete a no-op, route unsupported evidence/fields to review, or schedule a bounded technical retry.

### Prepare newsletter through F

**Type:** `executeWorkflow`

Invoke workflow F with the current item. Wait for the child outcome before continuing.

### Freeze newsletter delivery payload

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read frozen newsletter payload

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify frozen newsletter payload

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Prepared newsletter decision

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Send or defer

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Save pending Discord send

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read pending Discord send

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Build verified Discord request

**Type:** `code`

Verify the pending checkpoint read-back, then construct the exact body and optional UTF-8 text attachment from the frozen payload.

### Text or attachment

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Send one Discord message

**Type:** `httpRequest`

Send the prepared POST request to Discord. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Send full text attachment

**Type:** `httpRequest`

Send the prepared POST request to Discord. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Classify Discord delivery outcome

**Type:** `code`

Match a successful Discord response to the expected sender, channel, text, marker and attachment. Retry explicit rate limits; hold permanent failures; mark uncertain delivery for reconciliation.

### Receipt or simulated interruption

**Type:** `switch`

Route the item to an output branch according to the configured condition. No database mutation occurs in this routing node.

### Reconcile prior delivery

**Type:** `code`

Search up to 100 recent bot messages for one exact persistent marker/content match. Recover its receipt; otherwise require review rather than resend blindly.

### Save delivery outcome

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Read delivery outcome

**Type:** `httpRequest`

Read Google Sheets data using the saved credential. Pass the response and HTTP status to the next verifier; a successful transport response alone does not establish a valid business result.

### Verify delivery outcome

**Type:** `code`

Check the preceding response or context against the expected identity, schema or outcome. A failed check stops this path instead of treating it as success.

### Release owned delivery writer

**Type:** `httpRequest`

Send the prepared POST request to Google Sheets. The upstream Code node constructs the body and the downstream verifier checks the result. This is an external side-effect boundary when reachable.

### Return verified delivery status

**Type:** `code`

Verify exact-owner release succeeded and return status, attempt count and receipt identifiers to the caller. Do not claim COMPLETE before checkpoint verification.


## One-click failure and recovery proof

[Open workflow J](https://neelsabh.app.n8n.cloud/workflow/R68SWpvj3874vTpN)

### Manual - demonstrate retry and duplicate safety

**Type:** `manualTrigger`

Start the fictional recovery demonstration on demand. The full demo sends one fictional private error-channel message and verifies retry and duplicate handling; it does not change positions.

### Prepare isolated fictional demonstration

**Type:** `code`

Create a unique job key for this manual J execution and an explicitly fictional message limited to bot-errors. No portfolio data is read or changed.

### Attempt one - simulated temporary failure

**Type:** `executeWorkflow`

Invoke workflow I with the current item. Wait for the child outcome before continuing.

### Verify durable retry checkpoint

**Type:** `code`

Require RETRY_WAIT, attempt one and no message receipt before the demo continues.

### Wait for retry due time

**Type:** `wait`

Pause for the configured bounded interval before a retry or test continuation. It does not invent a successful result.

### Attempt two - recover and deliver

**Type:** `executeWorkflow`

Invoke workflow I with the current item. Wait for the child outcome before continuing.

### Verify successful recovery

**Type:** `code`

Require COMPLETE, attempt two and a saved message ID, then repeat the same job identity.

### Repeat completed job - duplicate check

**Type:** `executeWorkflow`

Invoke workflow I with the current item. Wait for the child outcome before continuing.

### Show final demonstration proof

**Type:** `code`

Assert that the third call is a duplicate no-op with the same message ID and unchanged attempt count. Return the proof fields and private Discord message link.

