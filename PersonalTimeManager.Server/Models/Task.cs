using Google.Cloud.Firestore;

[FirestoreData] 
public class TaskEntity
{
    [FirestoreProperty]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [FirestoreProperty]
    public string UserId { get; set; }

    [FirestoreProperty]
    public string Name { get; set; }

    [FirestoreProperty]
    public string Description { get; set; }

    [FirestoreProperty]
    public string Type { get; set; }

    [FirestoreProperty]
    public DateTime StartTime { get; set; }

    [FirestoreProperty]
    public DateTime EndTime { get; set; }

    [FirestoreProperty]
    public List<string> Dates { get; set; }
}
