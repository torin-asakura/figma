import type { FileResponse }        from 'figma-js'
import type { Node }                from 'figma-js'

import { describe }                 from 'node:test'
import { beforeEach }               from 'node:test'
import { it }                       from 'node:test'

import { expect }                   from 'playwright/test'

import { Group }                    from '../Constants.js'
import { FigmaThemeRadiiGenerator } from '../FigmaThemeRadiiGenerator.js'
import { SimpleMappingStrategy }    from '../strategy/index.js'

describe('FigmaThemeRadiiGenerator', () => {
  let generator: FigmaThemeRadiiGenerator

  beforeEach(() => {
    generator = new FigmaThemeRadiiGenerator()
  })

  it('should correctly identify and return nodes with radii', () => {
    const nodes = [
      { cornerRadius: 3 },
      { type: 'RECTANGLE', rectangleCornerRadii: [2, 3, 4, 5] },
      { type: 'TEXT', style: { fontSize: 16 } },
    ]

    const radii = generator.getRadii(nodes as never as ReadonlyArray<Node>)

    expect(radii).toEqual({
      [`${Group.SMALL}.semiDefault`]: '2px',
      [`${Group.SMALL}.default`]: '3px',
      [`${Group.SMALL}.semiIncreased`]: '4px',
      [`${Group.NORMAL}.default`]: '5px',
    })
  })

  it('should generate radii correctly', () => {
    const file = {
      document: {
        children: [
          { cornerRadius: 3 },
          { type: 'RECTANGLE', rectangleCornerRadii: [2, 3, 4, 5] },
          { type: 'TEXT', style: { fontSize: 16 } },
        ],
      },
    }

    const result = generator.generate(file as never as FileResponse)

    expect(result).toEqual({
      name: 'radii',
      content: `export const radii = {
    "small.semiDefault": "2px",
    "small.default": "3px",
    "small.semiIncreased": "4px",
    "normal.default": "5px"
}`,
    })
  })

  it('should map radii correctly using SimpleMappingStrategy', () => {
    const strategy = new SimpleMappingStrategy()
    const nodes = [
      { cornerRadius: 2 },
      { cornerRadius: 3 },
      { cornerRadius: 5 },
      { cornerRadius: 10 },
      { cornerRadius: 20 },
    ]

    const result = strategy.execute(nodes as never as ReadonlyArray<Node>)

    expect(result).toEqual({
      [`${Group.SMALL}.semiDefault`]: '2px',
      [`${Group.SMALL}.default`]: '3px',
      [`${Group.NORMAL}.default`]: '5px',
      [`${Group.MEDIUM}.default`]: '10px',
      [`${Group.LARGE}.default`]: '20px',
    })
  })

  it('should return empty object if no nodes with radii found', () => {
    const nodes = [{ type: 'TEXT', style: { fontSize: 16 } }]

    const radii = generator.getRadii(nodes as never as ReadonlyArray<Node>)

    expect(radii).toEqual({})

    const file = {
      document: {
        children: nodes,
      },
    }

    const result = generator.generate(file as never as FileResponse)

    expect(result).toEqual({
      name: 'radii',
      content: `export const radii = {}`,
    })
  })
})
