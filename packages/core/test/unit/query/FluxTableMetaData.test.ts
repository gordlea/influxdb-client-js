import {
  FluxTableColumn,
  FluxTableMetaData,
  ColumnType,
  typeSerializers,
  serializeDateTimeAsDate,
  serializeDateTimeAsNumber,
  serializeDateTimeAsString,
} from '../../../src'
import {expect} from 'chai'

describe('FluxTableMetaData', () => {
  it('returns columns by name or id', () => {
    const columns: FluxTableColumn[] = [
      FluxTableColumn.from({
        label: 'a',
        defaultValue: 'def',
        dataType: 'long',
        group: false,
      }),
      FluxTableColumn.from({
        label: 'b',
      }),
    ]
    const subject = new FluxTableMetaData(columns)
    expect(subject.column('a')).to.equals(columns[0])
    expect(subject.column('b')).to.equals(columns[1])
    expect(subject.columns[0]).to.equals(columns[0])
    expect(subject.columns[1]).to.equals(columns[1])
    expect(() => subject.column('c')).to.throw()
  })
  it('creates objects', () => {
    const columns: FluxTableColumn[] = [
      FluxTableColumn.from({
        label: 'a',
        defaultValue: '1',
        dataType: 'long',
        group: false,
      }),
      FluxTableColumn.from({
        label: 'b',
      }),
    ]
    const subject = new FluxTableMetaData(columns)
    expect(subject.toObject(['', ''])).to.deep.equal({a: 1, b: ''})
    expect(subject.toObject(['2', 'y'])).to.deep.equal({a: 2, b: 'y'})
    expect(subject.toObject(['3', 'y', 'z'])).to.deep.equal({a: 3, b: 'y'})
    expect(subject.toObject(['4'])).to.deep.equal({a: 4})
  })
  const serializationTable: Array<[ColumnType | undefined, string, any]> = [
    ['boolean', 'false', false],
    ['boolean', 'true', true],
    ['unsignedLong', '1', 1],
    ['unsignedLong', '', null],
    ['long', '1', 1],
    ['long', '', null],
    ['double', '1', 1],
    ['double', '', null],
    ['string', '1', '1'],
    ['base64Binary', '1', '1'],
    ['dateTime', '1', '1'],
    ['dateTime:RFC3339', '', null],
    ['duration', '1', '1'],
    ['duration', '', null],
    [undefined, '1', '1'],
  ]
  for (const entry of serializationTable) {
    it(`serializes ${entry[0]}/${entry[1]}`, () => {
      const columns: FluxTableColumn[] = [
        FluxTableColumn.from({
          label: 'a',
          dataType: entry[0],
        }),
      ]
      const subject = new FluxTableMetaData(columns)
      expect(subject.toObject([entry[1]])).to.deep.equal({a: entry[2]})
    })
  }
  describe('custom serialization', () => {
    let originalLong: (x: string) => any
    let originalDateTime: (x: string) => any
    beforeEach(() => {
      originalLong = typeSerializers['long']
      originalDateTime = typeSerializers['dateTime:RFC3339']
    })
    afterEach(() => {
      typeSerializers['long'] = originalLong
      typeSerializers['dateTime:RFC3339'] = originalDateTime
    })
    it('customizes serialization of long datatype', () => {
      typeSerializers['long'] = (_x: string): any => []
      const columns: FluxTableColumn[] = [
        FluxTableColumn.from({
          label: 'a',
          dataType: 'long',
          group: false,
        }),
      ]
      const subject = new FluxTableMetaData(columns)
      expect(subject.toObject([''])).to.deep.equal({a: []})
    })
    it('customizes serialization using serializeDateTimeAsDate', () => {
      serializeDateTimeAsDate()
      const columns: FluxTableColumn[] = [
        FluxTableColumn.from({
          label: 'a',
          dataType: 'dateTime:RFC3339',
          group: false,
        }),
      ]
      const subject = new FluxTableMetaData(columns)
      expect(subject.toObject([''])).to.deep.equal({a: null})
      expect(
        subject.toObject(['2020-08-19T09:14:23.798594313Z'])
      ).to.deep.equal({a: new Date(1597828463798)})
    })
    it('customizes serialization using serializeDateTimeAsNumber', () => {
      serializeDateTimeAsNumber()
      const columns: FluxTableColumn[] = [
        FluxTableColumn.from({
          label: 'a',
          dataType: 'dateTime:RFC3339',
          group: false,
        }),
      ]
      const subject = new FluxTableMetaData(columns)
      expect(subject.toObject([''])).to.deep.equal({a: null})
      expect(
        subject.toObject(['2020-08-19T09:14:23.798594313Z'])
      ).to.deep.equal({a: 1597828463798})
    })
    it('customizes serialization using serializeDateTimeAsString', () => {
      serializeDateTimeAsDate()
      serializeDateTimeAsString()
      const columns: FluxTableColumn[] = [
        FluxTableColumn.from({
          label: 'a',
          dataType: 'dateTime:RFC3339',
          group: false,
        }),
      ]
      const subject = new FluxTableMetaData(columns)
      expect(subject.toObject([''])).to.deep.equal({a: null})
      expect(
        subject.toObject(['1970-01-01T00:26:16.063594313Z'])
      ).to.deep.equal({a: '1970-01-01T00:26:16.063594313Z'})
    })
  })
})
