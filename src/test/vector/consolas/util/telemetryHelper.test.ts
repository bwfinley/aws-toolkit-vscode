/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert'
import { assertTelemetryCurried } from '../../../testUtil'
import { resetConsolasGlobalVariables } from '../testUtil'
import { TelemetryHelper } from '../../../../vector/consolas/util/telemetryHelper'

describe('telemetryHelper', function () {
    describe('getSuggestionState', function () {
        let telemetryHelper = new TelemetryHelper()
        beforeEach(function () {
            resetConsolasGlobalVariables()
            telemetryHelper = new TelemetryHelper()
        })

        it('user event is discard when recommendation 0 with accept index = -1 & recommendation prefix 0 does not match current code', function () {
            telemetryHelper.isPrefixMatched = [false, true]
            const actual = telemetryHelper.getSuggestionState(0, -1)
            assert.strictEqual(actual, 'Discard')
        })

        it('user event is reject when recommendation 0 with accept index = -1 & recommendation prefix 0 matches current code', function () {
            telemetryHelper.isPrefixMatched = [true, true]
            const actual = telemetryHelper.getSuggestionState(0, -1)
            assert.strictEqual(actual, 'Reject')
        })

        it('user event is discard when recommendation 1 with accept index = 1 & recommendation prefix 1 does not match code', function () {
            telemetryHelper.isPrefixMatched = [true, false]
            const actual = telemetryHelper.getSuggestionState(1, 1)
            assert.strictEqual(actual, 'Discard')
        })

        it('user event is Accept when recommendation 0 with accept index = 1 & recommendation prefix 0 matches code', function () {
            telemetryHelper.isPrefixMatched = [true, true]
            const actual = telemetryHelper.getSuggestionState(0, 0)
            assert.strictEqual(actual, 'Accept')
        })

        it('user event is Ignore when recommendation 0 with accept index = 1 & recommendation prefix 0 matches code', function () {
            telemetryHelper.isPrefixMatched = [true, true]
            const actual = telemetryHelper.getSuggestionState(0, 1)
            assert.strictEqual(actual, 'Ignore')
        })
    })

    describe('recordUserDecisionTelemetry', function () {
        it('Should call telemetry record for each recommendations with proper arguments', async function () {
            const telemetryHelper = new TelemetryHelper()
            const response = [{ content: "print('Hello')" }]
            const requestId = 'test_x'
            const sessionId = 'test_x'
            telemetryHelper.completionType = 'Line'
            telemetryHelper.triggerType = 'AutoTrigger'
            const assertTelemetry = assertTelemetryCurried('consolas_userDecision')
            const suggestionState = new Map<number, string>([[0, 'Showed']])
            await telemetryHelper.recordUserDecisionTelemetry(
                requestId,
                sessionId,
                response,
                0,
                'python',
                0,
                suggestionState
            )
            assertTelemetry({
                consolasRequestId: 'test_x',
                consolasSessionId: 'test_x',
                consolasPaginationProgress: 0,
                consolasTriggerType: 'AutoTrigger',
                consolasSuggestionIndex: 0,
                consolasSuggestionState: 'Discard',
                consolasSuggestionReferenceCount: 0,
                consolasCompletionType: 'Line',
                consolasLanguage: 'python',
                consolasRuntime: 'python2',
                consolasRuntimeSource: '2.7.16',
            })
        })
    })
})
