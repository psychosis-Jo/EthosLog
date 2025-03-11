import { Extension } from '@tiptap/core'

export interface IndentOptions {
  types: string[]
  minIndent: number
  maxIndent: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      /**
       * 增加缩进
       */
      indent: () => ReturnType
      /**
       * 减少缩进
       */
      outdent: () => ReturnType
    }
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'listItem', 'taskItem'],
      minIndent: 0,
      maxIndent: 7,
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            renderHTML: attributes => ({
              style: `margin-left: ${attributes.indent}em;`,
            }),
            parseHTML: element => {
              const indent = parseInt(element.style.marginLeft) || 0
              return indent
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { selection } = state
        const { ranges } = selection
        
        if (!dispatch) return false

        ranges.forEach(range => {
          state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const indent = (node.attrs.indent || 0) + 1
              if (indent <= this.options.maxIndent) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent,
                })
              }
            }
          })
        })

        return true
      },
      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state
        const { ranges } = selection
        
        if (!dispatch) return false

        ranges.forEach(range => {
          state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const indent = (node.attrs.indent || 0) - 1
              if (indent >= this.options.minIndent) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent,
                })
              }
            }
          })
        })

        return true
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      'Shift-Tab': () => this.editor.commands.outdent(),
    }
  },
}) 