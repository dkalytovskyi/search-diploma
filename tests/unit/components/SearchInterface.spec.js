import SearchInterface from "@/components/SearchInterface"
import { shallowMount } from "@vue/test-utils"

describe('SearchInterface', () => {
    let wrapper
    const propsData = {
        initialRequest: 'Request'
    }

    beforeEach(() => {
        wrapper = shallowMount(SearchInterface, { propsData })
    })

    it('should have correct initial data', () => {
        expect(wrapper.vm.$data.request).toBe(propsData.initialRequest)
        expect(wrapper.vm.$data.operators.length).toBe(10)
        expect(wrapper.vm.$data.operatorInput).toBe('')
        expect(wrapper.vm.$data.currentOperator).toBe(0)
    })

    it('should render correctly', () => {
        expect(wrapper.find('.search-container').exists()).toBeTruthy()
        expect(wrapper.find('.operators-container').exists()).toBeTruthy()
        expect(wrapper.find('.operators-input').exists()).toBeFalsy()
    })

    it('should test showInput method', () => {
        expect(wrapper.vm.$data.showOperatorInput).toBeFalsy()
        wrapper.vm.showInput(0)
        expect(wrapper.vm.$data.showOperatorInput).toBeTruthy()
        wrapper.vm.showInput(2)
        expect(wrapper.vm.$data.currentOperator).toBe(2)
    })

    it('should test changeCursorPosition method', () => {
        expect(wrapper.vm.$data.selectionStart).toEqual(null)
        expect(wrapper.vm.$data.selectionEnd).toEqual(null)

        const target = {
            selectionStart: 3,
            selectionEnd: 8
        }
        wrapper.vm.changeCursorPosition({ target })
        expect(wrapper.vm.$data.selectionStart).toBe(target.selectionStart)
        expect(wrapper.vm.$data.selectionEnd).toBe(target.selectionEnd)
    })

    it('should test hideInput method', () => {
        wrapper.vm.hideInput()
        expect(wrapper.vm.$data.showOperatorInput).toBeFalsy()
        expect(wrapper.vm.$data.operatorInput).toBe('')
        expect(wrapper.vm.$data.selectionStart).toBe(propsData.initialRequest.length)
        expect(wrapper.vm.$data.selectionEnd).toBe(propsData.initialRequest.length)
    })

    it('should test addToRequestAtPosition method', () => {
        wrapper.vm.addToRequestAtPosition(2, ' text ')
        expect(wrapper.vm.$data.request).toBe('Re text quest')
    })

    describe('operators handlers', () => {
        beforeEach(() => {
            wrapper.vm.$data.operatorInput = 'input'
            wrapper.vm.$data.selectionStart = propsData.initialRequest.length
            wrapper.vm.$data.selectionEnd = propsData.initialRequest.length
        })

        it('should test handleAndOperator', () => {
            wrapper.vm.handleAndOperator()
            expect(wrapper.vm.$data.request).toBe('Request input')
        })

        it('should test handleOrOperator', () => {
            wrapper.vm.handleOrOperator()
            expect(wrapper.vm.$data.request).toBe('Request | input')
        })

        it('should test handleNotOperator', () => {
            wrapper.vm.handleNotOperator()
            expect(wrapper.vm.$data.request).toBe('Request !input')
        })

        it('should test handleExactPhrase', () => {
            wrapper.vm.handleExactPhrase()
            expect(wrapper.vm.$data.request).toBe('Request \\"input\\"')
        })

        it('should test handleDistanceBetweenWords', () => {
            wrapper.vm.$data.operatorInput = '5'
            wrapper.vm.handleDistanceBetweenWords()
            expect(wrapper.vm.$data.request).toBe('Request~5')
        })

        it('should test handleQuorum', () => {
            wrapper.vm.$data.operatorInput = '5'
            wrapper.vm.handleQuorum()
            expect(wrapper.vm.$data.request).toBe('Request/5')
        })

        it('should test handleNear', () => {
            wrapper.vm.$data.operatorInput = '5'
            wrapper.vm.handleNear()
            expect(wrapper.vm.$data.request).toBe('Request NEAR/5 ')
        })

        it('should test handleFieldSearch', () => {
            wrapper.vm.request = ''
            wrapper.vm.handleFieldSearch()
            expect(wrapper.vm.$data.request).toBe('@input ')

            wrapper.vm.$data.operatorInput = 'field1, field2'
            wrapper.vm.handleFieldSearch()
            expect(wrapper.vm.$data.request).toBe('@input @(field1, field2) ')
        })

        it('should handle BEFORE action', () => {
            wrapper.vm.$data.operators.find(({ name }) => name === 'BEFORE').action()
            expect(wrapper.vm.$data.request).toBe('Request << ')
        })

        it('should handle ГРУПА action', () => {
            wrapper.vm.$data.selectionStart = 0
            wrapper.vm.$data.selectionEnd = propsData.initialRequest.length
            wrapper.vm.$data.operators.find(({ name }) => name === 'ГРУПА').action()
            expect(wrapper.vm.$data.request).toBe('(Request)')
        })
    })
})