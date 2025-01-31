using Google.Cloud.Firestore;

[FirestoreData]
public class TaskEntity
{
    [FirestoreDocumentId]
    public string Id { get; set; }

    [FirestoreProperty]
    public string UserId { get; set; }

    [FirestoreProperty]
    public string Name { get; set; }

    [FirestoreProperty]
    public string Description { get; set; }

    [FirestoreProperty]
    public string Type { get; set; }

    [FirestoreProperty]
    public List<string> Dates { get; set; } = new List<string>();

    [FirestoreProperty]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty]
    public Timestamp UpdatedAt { get; set; }
}
