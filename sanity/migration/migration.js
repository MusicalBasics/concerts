import {createClient} from '@sanity/client'

const client = createClient({
  apiVersion: '2022-03-25',
  projectId: 'zqcyefig',
  dataset: 'production',
  token:
    'skcEET1oF0tK6FltENUhc87cmaJ3DgMngWVFCbO6UgLz8VieuUI4s817z3vuROMGwuPngGI9GkicV4xqZssf0wRWFRjKsWOHEv4eJzPCPScsncs1Lsnt3KdLTtjQSLfKvSp5fEaOwCthl1l6tAR02VHXRU4fJlG2gCosIsbESvwWxUn357ob',
})

// Run this script from within your project folder in your terminal with: `sanity exec --with-user-token migrations/renameField.js`
//
// This example shows how you may write a migration script that renames a field (name => fullname)
// on a specific document type (author).
// This will migrate documents in batches of 100 and continue patching until no more documents are
// returned from the query.
//
// This script can safely be run, even if documents are being concurrently modified by others.
// If a document gets modified in the time between fetch => submit patch, this script will fail,
// but can safely be re-run multiple times until it eventually runs out of documents to migrate.

// A few things to note:
// - This script will exit if any of the mutations fail due to a revision mismatch (which means the
//   document was edited between fetch => update)
// - The query must eventually return an empty set, or else this script will continue indefinitely

// Fetching documents that matches the precondition for the migration.
// NOTE: This query should eventually return an empty set of documents to mark the migration
// as complete
const fetchDocuments = () => client.fetch('*[_type == "customer"]')

const buildPatches = (docs) =>
  docs.map((doc) => ({
    id: doc._id,
    patch: {
      set: {
        concert: {
          _type: 'reference',
          _ref: '4f4b9063-70e7-457f-b4b4-8494eadb85c1',
        },
      },
      // this will cause the transaction to fail if the documents has been
      // modified since it was fetched.
    },
  }))

const createTransaction = (patches) =>
  patches.reduce((tx, patch) => tx.patch(patch.id, patch.patch), client.transaction())

const commitTransaction = (tx) => tx.commit()

const migrateNextBatch = async () => {
  const documents = await fetchDocuments()
  const patches = buildPatches(documents)
  if (patches.length === 0) {
    console.log('No more documents to migrate!')
    return null
  }
  console.log(
    `Migrating batch:\n %s`,
    patches.map((patch) => `${patch.id} => ${JSON.stringify(patch.patch)}`).join('\n'),
  )
  const transaction = createTransaction(patches)
  await commitTransaction(transaction)
  return migrateNextBatch()
}

migrateNextBatch().catch((err) => {
  console.error(err)
  process.exit(1)
})
