const DataProxy = require('../data/DataProxy')
const QueryBuilder = require('../query/QueryBuilder')

class Dao {
  constructor(context) {
    if (typeof context === 'undefined') {
      throw new Error('Missing context object in dao instance. Maybe you forgot to call super constructor with context ?')
    }
    const { tableMetadata, databaseProxy } = context
    this.$tableMetadata = tableMetadata
    this.$databaseProxy = databaseProxy
    this.$dataProxy = new DataProxy()
    this.$queryBuilder = new QueryBuilder(this.$tableMetadata)
  }
  async findAll() {
    const query = this.$queryBuilder.getSelectQuery()
    const result = await this.$databaseProxy.query(query)
    return result.length === 0 ? result : this.$dataProxy.databaseToObject(result[0])
  }
  async findOne(identifier) {
    const conditionsObject = this.$getConditionsObjectFromArgument(identifier)
    const query = this.$queryBuilder.getSelectQueryWithConditionsObject(conditionsObject)
    const result = await this.$databaseProxy.query(query)
    if (result.length > 1) {
      throw new Error(`Multiple rows fetched from database in a findOne() query`)
    }
    return result.length === 0 ? result : this.$dataProxy.databaseToObject(result[0])
  }
  $getConditionsObjectFromArgument(argument) {
    if (typeof argument === 'string') {
      return { id: argument } // TODO make with metadata columsn
    } else if (typeof argument === 'object') {
      return this.$dataProxy.objectToDatabase(argument)
    } else if (typeof argument === 'function') {
      return this.$dataProxy.objectToDatabase(argument())
    } else {
      return argument
    }
  }
}

module.exports = Dao
