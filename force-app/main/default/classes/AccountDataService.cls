public  with sharing class AccountDataService {
    @Auraenabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [SELECT Name, Id, type FROM Account WITH SECURITY_ENFORCED ORDER BY Name];
    }
}