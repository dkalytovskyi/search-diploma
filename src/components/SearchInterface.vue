<template>
  <v-container>
    <div class="search-container">
      <v-text-field
          @keyup.native="changeCursorPosition"
          @click="changeCursorPosition"
          outlined
          label="Запит"
          v-model="request"
          clearable
      />
      <v-btn class="search-button" color="#70c56e">Виконати</v-btn>
    </div>
    <div class="operators-container">
      <v-tooltip v-for="(operator, index) in operators" :key="index" bottom>
        <template v-slot:activator="{ on }">
          <v-btn
              class="operator-button"
              v-on="on"
              :key="index"
              :disabled="!Boolean(request)"
              @click="operator.action(index)"
          >
            {{ operator.name }}
          </v-btn>
        </template>
        <span>{{ operator.tooltip }}</span>
      </v-tooltip>
    </div>
    <div class="operators-input" v-if="showOperatorInput && request">
      <v-text-field dense outlined :label="operators[currentOperator].name" v-model="operatorInput"/>
      <v-btn class="operators-input__button" @click="operators[currentOperator].handler">+</v-btn>
    </div>
  </v-container>
</template>

<script>
export default {
  name: 'SearchInterface',
  props: {
    initialRequest: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      request: this.initialRequest,
      operatorInput: '',
      selectionStart: null,
      selectionEnd: null,
      currentOperator: 0,
      showOperatorInput: false,
      operators: [
        {
          name: 'AND',
          action: this.showInput,
          handler: this.handleAndOperator,
          tooltip: 'Виконує дію логічного оператора AND. Введіть значення слова і воно буде додане до запиту у вигляді ` {слово}`'
        },
        {
          name: 'OR',
          action: this.showInput,
          handler: this.handleOrOperator,
          tooltip: 'Виконує дію логічного оператора OR. Введіть значення слова і воно буде додане до запиту у вигляді ` | {слово}`'
        },
        {
          name: 'NOT',
          action: this.showInput,
          handler: this.handleNotOperator,
          tooltip: 'Виконує дію логічного оператора NOT. Введіть значення слова і воно буде додане до запиту у вигляді ` !{слово}`'
        },
        {
          name: 'ГРУПА',
          action: () => {
            this.addToRequestAtPosition(this.selectionStart, '(')
            this.addToRequestAtPosition(this.selectionEnd + 1, ')')
            this.hideInput()
          },
          tooltip: 'Групує виділену частину запиту в круглі дужки'
        },
        {
          name: 'ТОЧНА ФРАЗА',
          action: this.showInput,
          handler: this.handleExactPhrase,
          tooltip: 'Введіть фразу і вона буде додана до запиту у вигляді \\"{точна фраза}\\"'
        },
        {
          name: 'БЛИЗЬКІСТЬ',
          action: this.showInput,
          handler: this.handleDistanceBetweenWords,
          tooltip: 'Введіть кількість слів і вона буде додана до запиту у вигляді `~N`'
        },
        {
          name: 'КВОРУМ',
          action: this.showInput,
          handler: this.handleQuorum,
          tooltip: 'Введіть мінімальну кількість ключових слів і вона буде додана до запиту у вигляді `/N`'
        },
        {
          name: 'BEFORE',
          action: () => {
            this.addToRequestAtPosition(this.selectionStart, ' << ')
            this.hideInput()
          },
          tooltip: 'Додає << у вибране місце в запиті'
        },
        {
          name: 'NEAR',
          action: this.showInput,
          handler: this.handleNear,
          tooltip: 'Введіть відстань між ключовими словами і вона буде додана до запиту у вигляді `NEAR/N`'
        },
        {
          name: 'ПОЛЕ',
          action: this.showInput,
          handler: this.handleFieldSearch,
          tooltip: 'Введіть назву(-и) (через кому) поля і вони будуть додані до запиту у вигляді `@поле` або `@(поле1, поле2)`'
        }
      ]
    }
  },
  methods: {
    /**
     * Sets the current operator index and changes operator input visibility
     * @param{number} index The index of the operator
     */
    showInput: function (index) {
      if (!(this.currentOperator !== index && this.showOperatorInput)) {
        this.showOperatorInput = !this.showOperatorInput
      }
      this.currentOperator = index
    },
    /**
     * Sets the selection start and end positions
     * @param{object} event The event that fired
     */
    changeCursorPosition: function ({ target }) {
      this.selectionStart = target.selectionStart
      this.selectionEnd = target.selectionEnd
    },
    /**
     * Hides and resets operator input, as well as selections start and end position to the end of request
     */
    hideInput: function () {
      this.showOperatorInput = false
      this.selectionStart = this.request.length
      this.selectionEnd = this.request.length
      this.operatorInput = ''
    },
    /**
     * Adds operator input to the request at cursor position with AND (' ')
     * @see addToRequestAtPosition
     * @see hideInput
     */
    handleAndOperator: function () {
      this.addToRequestAtPosition(this.selectionStart, ` ${this.operatorInput}`)
      this.hideInput()
    },
    /**
     * Adds operator input to the request at cursor position with OR (' | ')
     * @see addToRequestAtPosition
     * @see hideInput
     */
    handleOrOperator: function () {
      this.addToRequestAtPosition(this.selectionStart, ` | ${this.operatorInput}`)
      this.hideInput()
    },
    /**
     * Adds operator input to the request at cursor position with NOT ('!')
     * @see addToRequestAtPosition
     * @see hideInput
     */
    handleNotOperator: function () {
      this.addToRequestAtPosition(this.selectionStart, ` !${this.operatorInput}`)
      this.hideInput()
    },
    /**
     * Adds operator input to the request at cursor position as exact phrase (\"...\")
     * @see addToRequestAtPosition
     * @see hideInput
     */
    handleExactPhrase: function () {
      this.addToRequestAtPosition(this.selectionStart, ` \\"${this.operatorInput}\\"`)
      this.hideInput()
    },
    /**
     * Adds distance between words to the request at cursor position ('~N')
     * @see addToRequestAtPosition
     * @see hideInput
     */
    handleDistanceBetweenWords: function () {
      this.addToRequestAtPosition(this.selectionStart, `~${this.operatorInput}`)
      this.hideInput()
    },
    /**
     * Adds quorum to the request at cursor position ('/N')
     * @see addToRequestAtPosition
     * @see hideInput
     */
    handleQuorum: function () {
      this.addToRequestAtPosition(this.selectionStart, `/${this.operatorInput}`)
      this.hideInput()
    },
    /**
     * Adds NEAR operator to the request at cursor position ('NEAR/N')
     * @see addToRequestAtPosition
     * @see hideInput
     */
    handleNear: function () {
      this.addToRequestAtPosition(this.selectionStart, ` NEAR/${this.operatorInput} `)
      this.hideInput()
    },
    /**
     * Adds field operator to the request at cursor position ('@(field1, field2)' or '@field')
     * @see addToRequestAtPosition
     * @see hideInput
     */
    handleFieldSearch: function () {
      this.operatorInput.indexOf(',') > 0
          ? this.addToRequestAtPosition(this.selectionStart, `@(${this.operatorInput}) `)
          : this.addToRequestAtPosition(this.selectionStart, `@${this.operatorInput} `)
      this.hideInput()
    },
    /**
     * Adds string to request at a certain position
     * @param{number} index The position to add to
     * @param{string} str The string to add
     */
    addToRequestAtPosition: function (index, str) {
      this.request = this.request.substring(0, index) + str + this.request.substring(index, this.request.length)
    }
  }
}
</script>

<style lang="scss" scoped>
.search {
  &-container {
    display: flex;
    align-items: baseline;
  }
  &-button {
    margin: 0 10px;
    color: white !important;
  }
}
.operator-button {
  margin-right: 10px;
}
.operators {
  &-input {
    width: 250px;
    display: flex;
    align-items: baseline;
    &__button {
      margin-left: 10px;
    }
  }
  &-container {
    margin-bottom: 30px;
  }
}
.v-tooltip__content {
  max-width: 200px;
}
</style>
