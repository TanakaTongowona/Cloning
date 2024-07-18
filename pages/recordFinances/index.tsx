import type { NextPage } from "next";
import { useUser, useSupabaseClient, SupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { Text, Textarea, Grid, Button} from "@nextui-org/react"
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useState} from "react";
import { supabase } from "@supabase/auth-ui-react/dist/esm/common/theming";

const recordFinances: NextPage =  () => {
    const supabaseClient = useSupabaseClient();
    const user = useUser();
    const router = useRouter();
        
    const initialState = {
        transaction_date:"",
        transaction:"",
        category:"",
        amount:"",
        account_balance:""

    }
    const [financeData, setFinanceData] = useState (initialState);
    
    const handleChange = (e: any) =>{
            setFinanceData({...financeData, [e.target.name] : e.target.value })

    }
  
 
    const RecordFinances = async () => {
       try {
        const { data, error} = await supabaseClient
            .from ("personalfinance")
            .insert([
                {
                   transaction_date: financeData.transaction_date,
                   transaction: financeData.transaction,
                   category: financeData.category,
                   amount: financeData.amount,
                   account_balance: financeData.account_balance,
                   user_email: user?.email?.toLowerCase(),
                   user_id: user?.id

                }
            ])
            .single()
        if (error) throw error;
        setFinanceData(initialState);
        router.push("/mainFeed");

       }catch (error: any){
        alert(error.message);
       }

    }

  

    console.log(financeData);
//function to retrieve transactions from the supabase


const personalfinance  =  supabaseClient
    .from('personalfinance')
    .select('amount,category')
  

   
personalfinance.then (({data, error}) =>{
  if (data) {
//filter expenes and incomes
const expenses = data.filter((transaction: { category: string; }) => transaction.category === 'expenses');
const incomes = data.filter((transaction: { category: string; }) => transaction.category === 'incomes');
// Calculate total expenses and map amounts
const totalExpenses = expenses.reduce((total: any, expense: { amount: any; }) => total + expense.amount, 0);

// Calculate total incomes and map amounts
const totalIncomes = incomes.reduce((total: any, income: { amount: any; }) => total + income.amount, 0);

const balance = totalIncomes - totalExpenses;

console.log(`Account_balance: ${balance}`);

  }else {
    console.error(error);
  }
});
// use real time updates 
const channel = supabaseClient
    .from('personalfinance')
    .on('UPDATE', (payload: any) =>{
         //payload contains the updated data
     const newBalance = accountBalance(payload);
     document.getElementById('account-balance').innerHTML= newBalance;

    }).subscribe();





return(
    <Grid.Container>
       <Text h3>Transaction-date</Text>
       <Grid xs ={12}>
        <Textarea
          name="transaction_date"
          aria-label="transaction_date"
          placeholder="Transaction-date"
          fullWidth={true}
          rows={1}
          size="xl"
          onChange={handleChange}
        
        
        />
       </Grid>
       <Text h3>Transaction</Text>
       <Grid xs ={12}>
        <Textarea
          name="transaction"
          aria-label="transaction"
          placeholder="enter the transaction"
          fullWidth={true}
          rows={2}
          size="xl"
          onChange={handleChange}
        
        
        />
       </Grid>
       <Text h3>Category</Text>
        <Textarea
          name="category"
          aria-label="category"
          placeholder="Enter the value from the above options"
          fullWidth={true}
          rows={2}
          size="xl"
          onChange={handleChange}
        
        
        />
        <Grid xs ={12}>
        
        </Grid>
       <Text h3>Amount</Text>
       <Grid xs ={12}>
        <Textarea
          name="amount"
          aria-label="amount"
          placeholder="enter amount"
          fullWidth={true}
          rows={1}
          size="xl"
          onChange={handleChange}

        
        
        />
       </Grid>
       <Text h3 id="account-balance">Account-balance</Text>
       <Grid xs ={12}>
        <Textarea
          name="account_balance"
          aria-label="account-balance"
          placeholder="Account-balance"
          fullWidth={true}
          rows={1}
          size="xl"
          onChange={handleChange}
      
        
        
        />
       </Grid>
       
       <Grid xs={12}>
           <Text>
            Posting as {user?.email}
           </Text>

       </Grid>
       <Button onPress={RecordFinances}>Create Finance</Button>
       

      </Grid.Container>
)

}
export default recordFinances;
export const getServerSideProps = withPageAuth({ redirectTo: "/login"});

function accountBalance(payload: any) {
  throw new Error("Function not implemented.");
}

