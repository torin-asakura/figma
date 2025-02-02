import type { FileResponse }              from 'figma-js'
import type { Text }                      from 'figma-js'
import type { Node }                      from 'figma-js'

import { describe }                       from 'node:test'
import { beforeEach }                     from 'node:test'
import { it }                             from 'node:test'

import { expect }                         from 'playwright/test'

import { FigmaThemeFontWeightsGenerator } from '../FigmaThemeFontWeightsGenerator.js'
import { SimpleMappingStrategy }          from '../strategy/index.js'

describe('FigmaThemeFontWeightsGenerator', () => {
  let generator: FigmaThemeFontWeightsGenerator

  beforeEach(() => {
    generator = new FigmaThemeFontWeightsGenerator()
  })

  it('should correctly identify and return text nodes', () => {
    const nodes = [
      { type: 'TEXT', style: { fontWeight: 400 } },
      { type: 'RECTANGLE' },
      { type: 'TEXT', style: { fontWeight: 700 } },
    ]

    const textNodes = generator.getFontWeights(nodes as unknown as ReadonlyArray<Node>)

    expect(textNodes).toEqual([
      { type: 'TEXT', style: { fontWeight: 400 } },
      { type: 'TEXT', style: { fontWeight: 700 } },
    ])
  })

  it('should generate font weights correctly', () => {
    const file = {
      document: {
        children: [
          {
            type: 'TEXT',
            style: { fontWeight: 400 },
          },
          {
            type: 'TEXT',
            style: { fontWeight: 700 },
          },
          {
            type: 'RECTANGLE',
          },
        ],
      },
    }

    const result = generator.generate(file as unknown as FileResponse)

    expect(result).toEqual({
      name: 'fontWeights',
      content: `export const fontWeights = {
    "normal": "400",
    "bold": "700"
}`,
    })
  })

  it('should map font weights correctly using SimpleMappingStrategy', () => {
    const strategy = new SimpleMappingStrategy()
    const textNodes = [
      { type: 'TEXT', style: { fontWeight: 300 } },
      { type: 'TEXT', style: { fontWeight: 500 } },
      { type: 'TEXT', style: { fontWeight: 900 } },
    ]

    const result = strategy.execute(textNodes as unknown as Array<Text>)

    expect(result).toEqual({
      light: '300',
      medium: '500',
      heavy: '900',
    })
  })

  it('should return empty object if no text nodes found', () => {
    const nodes = [{ type: 'RECTANGLE' }, { type: 'CIRCLE' }]

    const textNodes = generator.getFontWeights(nodes as unknown as ReadonlyArray<Node>)

    expect(textNodes).toEqual([])

    const file = {
      document: {
        children: nodes,
      },
    }

    const result = generator.generate(file as unknown as FileResponse)

    expect(result).toEqual({
      name: 'fontWeights',
      content: `export const fontWeights = {}`,
    })
  })
})
