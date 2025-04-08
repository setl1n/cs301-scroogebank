package com.cs301g2t1.account.repository;

import com.cs301g2t1.account.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Long> {
}
